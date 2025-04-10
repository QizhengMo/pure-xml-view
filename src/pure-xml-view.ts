export class PureXml extends HTMLElement {
  private _container: HTMLDivElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._initializeComponent();
  }

  static get observedAttributes(): string[] {
    return ['data'];
  }

  private _initializeComponent(): void {
    // Initial styling for the component
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-wrap: wrap;
          font-family: monospace;
          white-space: pre-wrap;
          background-color: #f5f5f5;
          border-radius: 4px;
          overflow: hidden;
          max-height: 80vh;
          position: relative;
        }
        .toolbar {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          padding: 8px;
          background-color: #e0e0e0;
          border-bottom: 1px solid #ccc;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .toolbar-button {
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 3px;
          padding: 4px 8px;
          margin-right: 8px;
          cursor: pointer;
          font-family: sans-serif;
          font-size: 12px;
        }
        .toolbar-button:hover {
          background-color: #f0f0f0;
        }
        .toolbar-button:active {
          background-color: #e5e5e5;
        }
        .xml-container {
          width: 100%;
          margin: 0;
          padding: 1rem 1rem 1rem 2rem;
          overflow: auto;
          max-height: calc(80vh - 40px);
        }
        .xml-node {
          margin-left: 20px;
          position: relative;
        }
        .xml-tag {
          color: #0000cc;
        }
        .xml-attr-name {
          color: #990000;
        }
        .xml-attr-value {
          color: #006600;
        }
        .xml-content {
          color: #333;
        }
        .xml-comment {
          color: #888888;
          font-style: italic;
        }
        .toggle-btn {
          cursor: pointer;
          width: 16px;
          height: 16px;
          display: inline-block;
          text-align: center;
          line-height: 14px;
          border: 1px solid #ccc;
          margin-right: 4px;
          position: absolute;
          left: -20px;
          top: 2px;
          background-color: #fff;
          border-radius: 3px;
          font-size: 12px;
        }
        .toggle-btn:hover {
          background-color: #eee;
        }
        .collapsed {
          display: none !important;
        }
        .xml-declaration {
          color: #888888;
          font-weight: bold;
        }
        .line {
          min-height: 18px;
          line-height: 18px;
          position: relative;
        }
        .node-block {
          position: relative;
        }
      </style>
      <div class="toolbar">
        <button class="toolbar-button" id="expand-all-btn">Expand All</button>
        <button class="toolbar-button" id="collapse-all-btn">Collapse All</button>
      </div>
      <div class="xml-container"></div>
    `;

    this._container = this.shadowRoot!.querySelector('.xml-container');

    // Add toolbar button event listeners
    const expandAllBtn = this.shadowRoot!.querySelector('#expand-all-btn');
    const collapseAllBtn = this.shadowRoot!.querySelector('#collapse-all-btn');

    expandAllBtn?.addEventListener('click', () => this.expandAll());
    collapseAllBtn?.addEventListener('click', () => this.collapseAll());
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'data' && newValue !== oldValue) {
      this._parseAndRender(newValue || '');
    }
  }

  private _parseAndRender(xmlString: string): void {
    if (!xmlString || !this._container) {
      if (this._container) {
        this._container.textContent = 'No XML data provided';
      }
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('XML parsing error: ' + parseError.textContent);
      }

      this._container.innerHTML = '';

      // Check if there's an XML declaration and add it
      const declaration = xmlString.match(/<\?xml[^>]*\?>/);
      if (declaration) {
        const declDiv = document.createElement('div');
        declDiv.className = 'line xml-declaration';
        declDiv.textContent = declaration[0];
        this._container.appendChild(declDiv);
      }

      this._renderNode(xmlDoc, this._container);

      // Add toggle functionality
      this._setupToggleButtons();
    } catch (error) {
      if (error instanceof Error) {
        this._container.textContent = 'Error rendering XML: ' + error.message;
      } else {
        this._container.textContent = 'Unknown error rendering XML';
      }
    }
  }

  private _renderNode(node: Node, parentElement: HTMLElement): void {
    // Process each child of the current node
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i];

      if (childNode.nodeType === Node.ELEMENT_NODE) {
        this._renderElementNode(childNode as Element, parentElement);
      } else if (childNode.nodeType === Node.TEXT_NODE) {
        this._renderTextNode(childNode as Text, parentElement);
      } else if (childNode.nodeType === Node.COMMENT_NODE) {
        this._renderCommentNode(childNode as Comment, parentElement);
      }
    }
  }

  private _renderElementNode(node: Element, parentElement: HTMLElement): void {
    // Create a wrapper to group the node and all its children for toggling
    const nodeBlock = document.createElement('div');
    nodeBlock.className = 'node-block';
    parentElement.appendChild(nodeBlock);

    const nodeContainer = document.createElement('div');
    nodeContainer.className = 'line';
    nodeBlock.appendChild(nodeContainer);

    // Create opening tag line
    const hasChildren = node.childNodes.length > 0 &&
      Array.from(node.childNodes).some(n => n.nodeType !== Node.TEXT_NODE || n.textContent?.trim() !== '');

    if (hasChildren) {
      const toggleBtn = document.createElement('span');
      toggleBtn.className = 'toggle-btn';
      toggleBtn.textContent = '-';
      toggleBtn.setAttribute('data-action', 'toggle');
      nodeContainer.appendChild(toggleBtn);
    }

    const openTag = document.createElement('span');
    openTag.className = 'xml-tag';
    openTag.textContent = '<' + node.nodeName;
    nodeContainer.appendChild(openTag);

    // Add attributes
    if (node.attributes && node.attributes.length > 0) {
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        const attrSpace = document.createElement('span');
        attrSpace.textContent = ' ';
        nodeContainer.appendChild(attrSpace);

        const attrName = document.createElement('span');
        attrName.className = 'xml-attr-name';
        attrName.textContent = attr.name;
        nodeContainer.appendChild(attrName);

        const attrEquals = document.createElement('span');
        attrEquals.textContent = '="';
        nodeContainer.appendChild(attrEquals);

        const attrValue = document.createElement('span');
        attrValue.className = 'xml-attr-value';
        attrValue.textContent = attr.value;
        nodeContainer.appendChild(attrValue);

        const attrQuote = document.createElement('span');
        attrQuote.textContent = '"';
        nodeContainer.appendChild(attrQuote);
      }
    }

    // Check if it's a self-closing tag or has children
    if (node.childNodes.length === 0) {
      const closeTag = document.createElement('span');
      closeTag.className = 'xml-tag';
      closeTag.textContent = ' />';
      nodeContainer.appendChild(closeTag);
    } else {
      const closeOpenTag = document.createElement('span');
      closeOpenTag.className = 'xml-tag';
      closeOpenTag.textContent = '>';
      nodeContainer.appendChild(closeOpenTag);

      // Create a container for child nodes
      const childContainer = document.createElement('div');
      childContainer.className = 'xml-node';
      nodeBlock.appendChild(childContainer);

      // Recursively render children
      this._renderNode(node, childContainer);

      // Create closing tag
      const closingLine = document.createElement('div');
      closingLine.className = 'line';
      const closingTag = document.createElement('span');
      closingTag.className = 'xml-tag';
      closingTag.textContent = '</' + node.nodeName + '>';
      closingLine.appendChild(closingTag);
      nodeBlock.appendChild(closingLine);
    }
  }

  private _renderTextNode(node: Text, parentElement: HTMLElement): void {
    const text = node.textContent ? node.textContent.trim() : '';
    if (text) {
      const textLine = document.createElement('div');
      textLine.className = 'line';
      const textSpan = document.createElement('span');
      textSpan.className = 'xml-content';
      textSpan.textContent = text;
      textLine.appendChild(textSpan);
      parentElement.appendChild(textLine);
    }
  }

  private _renderCommentNode(node: Comment, parentElement: HTMLElement): void {
    const commentLine = document.createElement('div');
    commentLine.className = 'line';
    const commentSpan = document.createElement('span');
    commentSpan.className = 'xml-comment';
    commentSpan.textContent = '<!--' + node.textContent + '-->';
    commentLine.appendChild(commentSpan);
    parentElement.appendChild(commentLine);
  }

  private _setupToggleButtons(): void {
    const toggleBtns = this.shadowRoot!.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const parentLine = btn.closest('.line') as HTMLElement;
        const nodeBlock = parentLine.closest('.node-block') as HTMLElement;

        // Find all content after the opening line but before the closing line
        // This includes all child nodes and their content
        const contentElements = Array.from(nodeBlock.querySelectorAll(':scope > .xml-node, :scope > .line:not(:first-child)'));

        if (contentElements.length > 0) {
          const isCollapsed = contentElements[0].classList.contains('collapsed');

          if (isCollapsed) {
            // Expand
            contentElements.forEach(elem => elem.classList.remove('collapsed'));
            btn.textContent = '-';
          } else {
            // Collapse
            contentElements.forEach(elem => elem.classList.add('collapsed'));
            btn.textContent = '+';
          }
        }
      });
    });
  }

  // Public method to set XML data programmatically
  public setXmlData(xmlString: string): void {
    this.setAttribute('data', xmlString);
  }

  // Public method to collapse all nodes
  public collapseAll(): void {
    // Find all node blocks
    const nodeBlocks = this.shadowRoot!.querySelectorAll('.node-block');

    nodeBlocks.forEach(block => {
      // For each node block, find all content after the opening line
      const contentElements = Array.from(block.querySelectorAll(':scope > .xml-node, :scope > .line:not(:first-child)'));
      contentElements.forEach(elem => elem.classList.add('collapsed'));

      // Update the toggle button
      const toggleBtn = block.querySelector('.toggle-btn');
      if (toggleBtn) {
        toggleBtn.textContent = '+';
      }
    });
  }

  // Public method to expand all nodes
  public expandAll(): void {
    // Find all collapsed elements and remove the collapsed class
    const collapsedElements = this.shadowRoot!.querySelectorAll('.collapsed');
    collapsedElements.forEach(elem => elem.classList.remove('collapsed'));

    // Update all toggle buttons
    const toggleBtns = this.shadowRoot!.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
      btn.textContent = '-';
    });
  }
}

// Register the custom element
customElements.define('pure-xml-view', PureXml);