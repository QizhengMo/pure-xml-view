export class PureXml extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

  // Shadow DOM for encapsulation
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
  }

  attributeChangedCallback() {
    if (this.shadowRoot) {
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        @media (max-width: 768px) {
            .container {
                grid-template-columns: 1fr;
            }
        }

        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }

        .input-section, .output-section {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        textarea {
            width: 100%;
            height: 300px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: monospace;
            resize: vertical;
        }

        button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 10px;
        }

        button:hover {
            background-color: #45a049;
        }

        #xml-renderer {
            margin-top: 20px;
            font-family: monospace;
            overflow: auto;
        }

        .node {
            margin-left: 20px;
        }

        .node-content {
            display: block;
            padding: 2px 0;
        }

        .toggle {
            cursor: pointer;
            display: inline-block;
            width: 20px;
            height: 20px;
            text-align: center;
            line-height: 20px;
            background-color: #eee;
            border-radius: 3px;
            margin-right: 5px;
        }

        .toggle:hover {
            background-color: #ddd;
        }

        .tag-name {
            color: #0066cc;
            font-weight: bold;
        }

        .attribute {
            color: #e6550d;
        }

        .attribute-value {
            color: #31a354;
        }

        .text-content {
            color: #333;
        }

        .collapsed .node {
            display: none;
        }

        .error {
            color: red;
            font-family: monospace;
            white-space: pre-wrap;
        }

        .sample-button {
            background-color: #007bff;
            margin-right: 10px;
        }

        .sample-button:hover {
            background-color: #0069d9;
        }

        .clear-button {
            background-color: #dc3545;
        }

        .clear-button:hover {
            background-color: #c82333;
        }

        .buttons-group {
            margin-top: 10px;
            display: flex;
            gap: 10px;
        }
      </style>
      <slot id="xml-input"></slot>
      <div class="output-section">
          <h2>Rendered XML</h2>
          <div id="xml-renderer"></div>
      </div>
    `;
    const xmlRenderer = document.getElementById('xml-renderer');
    const input = document.getElementById('xml-input')!.textContent;
    this.renderXML(input, xmlRenderer!);
  }

  // Parse and render XML
  renderXML(xmlString: string | null, xmlRenderer: HTMLElement) {

    if (!xmlString) {
      xmlRenderer.innerHTML = '<div class="error">Please enter some XML to render.</div>';
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

      // Check for parsing errors
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        xmlRenderer.innerHTML = '<div class="error">XML Parsing Error: ' + parseError[0].textContent + '</div>';
        return;
      }

      // Clear previous content
      xmlRenderer.innerHTML = '';

      // Process the XML document
      this.renderNode(xmlDoc, xmlRenderer);

      // Add event listeners for toggling nodes
      this.addToggleListeners();

    } catch (error: any) {
      xmlRenderer.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
    }
  }

  // Render a node and its children
  renderNode(node: any, container: HTMLElement) {
    if (node.nodeType === Node.DOCUMENT_NODE) {
      // Handle XML declaration if present
      const declaration = node.xmlVersion ?
        `<?xml version="${node.xmlVersion}" encoding="${node.xmlEncoding || 'UTF-8'}"?>` : '';

      if (declaration) {
        const declElement = document.createElement('div');
        declElement.className = 'node-content';
        declElement.innerHTML = `<span class="text-content">${declaration}</span>`;
        container.appendChild(declElement);
      }

      // Process root element
      for (let i = 0; i < node.childNodes.length; i++) {
        this.renderNode(node.childNodes[i], container);
      }
    }
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const hasChildren = node.hasChildNodes() &&
        (node.children.length > 0 ||
          (node.textContent.trim() !== '' && node.childNodes.length > 0));

      const nodeElement = document.createElement('div');
      nodeElement.className = 'node-container';

      const nodeContent = document.createElement('div');
      nodeContent.className = 'node-content';

      let html = '';

      // Add toggle button if the node has children
      if (hasChildren) {
        html += '<span class="toggle">-</span>';
      } else {
        html += '<span class="toggle" style="visibility: hidden;">-</span>';
      }

      // Opening tag
      html += '&lt;<span class="tag-name">' + node.nodeName + '</span>';

      // Attributes
      if (node.attributes && node.attributes.length > 0) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          html += ' <span class="attribute">' + attr.name + '</span>=';
          html += '"<span class="attribute-value">' + attr.value + '</span>"';
        }
      }

      if (!hasChildren) {
        html += ' /&gt;';
      } else {
        html += '&gt;';
      }

      nodeContent.innerHTML = html;
      nodeElement.appendChild(nodeContent);

      if (hasChildren) {
        // Container for child nodes
        const childContainer = document.createElement('div');
        childContainer.className = 'node';

        // Process child nodes
        for (let i = 0; i < node.childNodes.length; i++) {
          const childNode = node.childNodes[i];

          // Handle text nodes
          if (childNode.nodeType === Node.TEXT_NODE) {
            const text = childNode.nodeValue.trim();
            if (text) {
              const textElement = document.createElement('div');
              textElement.className = 'node-content';
              textElement.innerHTML = '<span class="text-content">' + this.escapeHTML(text) + '</span>';
              childContainer.appendChild(textElement);
            }
          } else {
            this.renderNode(childNode, childContainer);
          }
        }

        nodeElement.appendChild(childContainer);

        // Closing tag
        const closingElement = document.createElement('div');
        closingElement.className = 'node-content';
        closingElement.innerHTML = '&lt;/<span class="tag-name">' + node.nodeName + '</span>&gt;';
        nodeElement.appendChild(closingElement);
      }

      container.appendChild(nodeElement);
    }
    // Handle other node types as needed (comment, processing instruction, etc.)
    else if (node.nodeType === Node.COMMENT_NODE) {
      const commentElement = document.createElement('div');
      commentElement.className = 'node-content';
      commentElement.innerHTML = '<span class="text-content">&lt;!-- ' + node.nodeValue + ' --&gt;</span>';
      container.appendChild(commentElement);
    }
  }

  // Add event listeners for toggle buttons
  addToggleListeners() {
    const toggles = document.querySelectorAll('.toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        if (!e.target) return;
        // @ts-ignore
        const nodeContainer = e.target.closest('.node-container');
        nodeContainer.classList.toggle('collapsed');
        // @ts-ignore
        e.target.textContent = nodeContainer.classList.contains('collapsed') ? '+' : '-';
      });
    });
  }

  // Helper function to escape HTML
  escapeHTML(str: string) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

}

// Define the custom element
if (!customElements.get('pure-xml-view')) {
  customElements.define('pure-xml-view', PureXml);
}
