# Pure XML Viewer Web Component
A simple lightweight web component for rendering XML data in a tree view format.

*Majority of code DONE BY VIDE CODING, USE WITH CAUTION*

Built this simply because I cannot find a simple XML view with expand/collapse functionality that I can use in vanilla JS.

## Features

- **Interactive Tree View**: Expand and collapse XML nodes with simple toggles
- **Syntax Highlighting**: Color-coded XML elements, attributes, and content
- **Built-in Controls**: Expand All and Collapse All buttons in a convenient toolbar
- **Pure Web Component**: Zero dependencies, works with any framework or vanilla JS

## Installation

### Option 1: Via NPM

```bash
npm install pure-xml-view
```

Then import it in your JS/TS file:

```javascript
import 'pure-xml-view';
```

### Option 2: Via CDN

```html
<script type="module" src="https://unpkg.com/pure-xml-view@1.0.0/dist/index.js"></script>
```

### Option 3: Download and include directly

Download the `pure-xml-view.js` file and include it in your HTML:

```html
<script type="module" src="path/to/pure-xml-view.js"></script>
```

## Usage

After including the component, you can use it in your HTML:

```html
<!-- Basic usage with XML as an attribute -->
<pure-xml-view data="<root><item>Content</item></root>"></pure-xml-view>

<!-- Or set the XML programmatically -->
<pure-xml-view id="my-viewer"></pure-xml-view>
<script>
  const viewer = document.getElementById('my-viewer');
  viewer.setXmlData('<root><item>Content</item></root>');
</script>
```

## API

### Attributes

| Attribute | Type   | Description              |
|-----------|--------|--------------------------|
| `data`    | string | The XML string to render |

### Methods

| Method                | Description                                       |
|-----------------------|---------------------------------------------------|
| `setXmlData(string)`  | Sets the XML content programmatically             |
| `expandAll()`         | Expands all nodes in the view                     |
| `collapseAll()`       | Collapses all nodes in the view                   |

### Events

The component doesn't emit any custom events currently.

## Styling

While the component comes with built-in styling, you can customize its appearance using CSS variables or by targeting the shadow DOM parts in the future.

## Complete Example

Here's a complete example of using the component:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>XML Viewer Demo</title>
  <script src="path/to/pure-xml-view.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    pure-xml-view {
      margin-top: 20px;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <h1>XML Viewer Demo</h1>
  
  <pure-xml-view id="xml-viewer"></pure-xml-view>
  
  <script>
    const viewer = document.getElementById('xml-viewer');
    
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<library>
  <!-- Book collection -->
  <books>
    <book id="b1">
      <title>The Great Gatsby</title>
      <author>F. Scott Fitzgerald</author>
      <year>1925</year>
    </book>
    <book id="b2">
      <title>To Kill a Mockingbird</title>
      <author>Harper Lee</author>
      <year>1960</year>
    </book>
  </books>
  <magazines>
    <magazine id="m1">
      <title>National Geographic</title>
      <frequency>Monthly</frequency>
    </magazine>
  </magazines>
</library>`;
    
    viewer.setXmlData(sampleXml);
  </script>
</body>
</html>
```