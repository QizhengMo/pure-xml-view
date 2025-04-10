export class PureXml extends HTMLElement {
  static get observedAttributes() {
    return ['data'];
  }

  get data() {
    return this.getAttribute('data') || '';
  }
  // Shadow DOM for encapsulation
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
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

        .node-container {
            display: flex;
        }
        
        .node {
            display: block;
            margin-left: 20px;
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
    `;
    const xmlWrapper = document.createElement('div');
    xmlWrapper.className = 'output-section';
    this.shadowRoot.appendChild(xmlWrapper);

    const xmlRenderer = document.createElement('div');
    this.renderXML(this.data, xmlRenderer!);
    xmlWrapper.appendChild(xmlRenderer);
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

    } catch (error: any) {
      xmlRenderer.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
      console.error('Error rendering XML:', error);
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

      let html = '';
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

      // > or /> for self-closing tags
      if (!hasChildren) {
        html += ' /&gt;';
      } else {
        html += '&gt;';
      }

      nodeContent.innerHTML = html;
      nodeElement.appendChild(nodeContent);

      let child = null;
      if (hasChildren) {
        if (node.childNodes[0].nodeType === Node.TEXT_NODE) {
          const text = node.childNodes[0].nodeValue.trim();
          const child = document.createElement('span');
          child.className = 'text-content';
          child.innerHTML = this.escapeHTML(text);
        } else {
          // Container for child nodes
          const child = document.createElement('div');
          child.className = 'node';

          // Process child nodes
          for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i];
            this.renderNode(childNode, child);
          }
        }
        nodeElement.appendChild(child!);

        // Closing tag
        const closingElement = document.createElement('div');
        // closingElement.className = 'node-content';
        closingElement.innerHTML = '&lt;/<span class="tag-name">' + node.nodeName + '</span>&gt;';
        nodeElement.appendChild(closingElement);
      }

      container.appendChild(nodeElement);
    }
    // Handle other node types as needed (comment, processing instruction, etc.)
    else if (node.nodeType === Node.COMMENT_NODE) {
      const commentElement = document.createElement('div');
      // commentElement.className = 'node-content';
      commentElement.innerHTML = '<span class="text-content">&lt;!-- ' + node.nodeValue + ' --&gt;</span>';
      container.appendChild(commentElement);
    }
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
