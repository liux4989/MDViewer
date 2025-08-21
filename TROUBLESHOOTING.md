# TOC Extraction Troubleshooting Guide

## 🔍 Issue: Real Content Not Being Updated

### Possible Causes and Solutions

#### 1. **Document Mode Detection Issues**

**Problem**: The plugin might not be detecting the correct document mode (preview vs source).

**Debug Steps**:
1. Open Obsidian Developer Tools (Ctrl/Cmd + Shift + I)
2. Run the command "Debug TOC Extraction" from the command palette
3. Check the console output for:
   - Active view mode (should show 'preview' or 'source')
   - Container elements found
   - Number of headings detected

**Expected Output**:
```
Active view mode: preview
Container 1: DIV markdown-preview-view
  - Found 5 headings
    1. H1: "Introduction"
    2. H2: "Getting Started"
    ...
```

#### 2. **DOM Structure Changes**

**Problem**: Obsidian's DOM structure might have changed, and our selectors are outdated.

**Debug Steps**:
1. In Developer Tools, inspect the active document
2. Look for elements with classes:
   - `.markdown-preview-view`
   - `.markdown-reading-view`
   - `.view-content`
3. Check if headings (H1-H6) are present in these containers

**Solution**: Update selectors in `main.ts` if needed.

#### 3. **Timing Issues**

**Problem**: The plugin might be trying to extract content before the document is fully rendered.

**Debug Steps**:
1. Try manually running "Refresh TOC" command after the document loads
2. Check if switching between documents updates the TOC
3. Look for timing-related errors in console

**Solution**: Add delays or better event handling.

#### 4. **Source Mode Parsing**

**Problem**: Markdown parsing in source mode might not be working correctly.

**Debug Steps**:
1. Switch to source mode in Obsidian
2. Run "Debug TOC Extraction" command
3. Check console for markdown parsing output

**Expected Output**:
```
Document is in source mode, attempting to parse markdown...
Got markdown content, length: 1234
Created temporary container from markdown
Temp container has 5 headings
```

#### 5. **Event Listener Issues**

**Problem**: Document change events might not be firing correctly.

**Debug Steps**:
1. Switch between different markdown files
2. Edit a document (add/remove headings)
3. Check console for event firing messages

**Solution**: Verify event listeners are properly registered.

### 🛠️ Manual Testing Steps

#### Step 1: Basic Functionality Test
1. Open a markdown document with headings in Obsidian
2. Toggle the TOC with Ctrl/Cmd + P → "Toggle Floating TOC"
3. Check if TOC appears (even if empty)

#### Step 2: Debug Command Test
1. Run Ctrl/Cmd + P → "Debug TOC Extraction"
2. Check Developer Tools console for detailed output
3. Look for any error messages

#### Step 3: Manual Refresh Test
1. Run Ctrl/Cmd + P → "Refresh TOC"
2. Check if TOC updates with current document headings

#### Step 4: Document Mode Test
1. Switch between Preview and Source modes
2. Run "Refresh TOC" in each mode
3. Check console output for mode-specific behavior

### 🔧 Quick Fixes to Try

#### Fix 1: Force Update on Plugin Load
Add this to the plugin initialization:
```typescript
// Add a delay to ensure document is loaded
setTimeout(() => {
    this.updateTocFromCurrentDocument();
}, 1000);
```

#### Fix 2: Alternative DOM Selectors
Try these alternative selectors in `updateTocFromCurrentDocument()`:
```typescript
// Try broader selectors
const selectors = [
    '.markdown-preview-view',
    '.markdown-reading-view', 
    '.view-content .markdown-preview-view',
    '.workspace-leaf-content .markdown-preview-view',
    '[data-type="markdown"] .markdown-preview-view'
];
```

#### Fix 3: Force Preview Mode
Add this check to ensure preview mode:
```typescript
if (activeView.getMode() === 'source') {
    // Try to switch to preview mode temporarily
    activeView.setState({ mode: 'preview' }, {});
    // Wait a bit then extract
    setTimeout(() => this.updateTocFromCurrentDocument(), 500);
    return;
}
```

### 📊 Expected Console Output (Working)

When everything is working correctly, you should see:
```
Loading Floating TOC plugin
TOC Manager or Floating TOC not initialized
Active view found: MarkdownView
Document is in preview mode
Found preview content element
Content element tag: DIV
Content element classes: markdown-preview-view
Content element children count: 15
Found 8 headings in document
Heading 1: H1 Introduction
Heading 2: H2 Getting Started
Heading 3: H3 Installation
HeadingExtractor: Starting extraction from container: DIV markdown-preview-view
HeadingExtractor: Found 8 heading elements
HeadingExtractor: Heading 1: H1 - "Introduction" (id: introduction)
TOC extraction result: 3 entries
```

### 🚨 Common Error Patterns

#### Error 1: "No active markdown view found"
- **Cause**: No markdown document is open
- **Solution**: Open a .md file in Obsidian

#### Error 2: "No content element found"
- **Cause**: DOM selectors not matching Obsidian's structure
- **Solution**: Update selectors or add fallbacks

#### Error 3: "Found 0 headings in document"
- **Cause**: Document has no headings or wrong container selected
- **Solution**: Check document content and DOM structure

#### Error 4: "HeadingExtractor: Found 0 heading elements"
- **Cause**: Extraction logic not finding H1-H6 elements
- **Solution**: Debug container content and heading structure

### 🧪 Test Files

Use these test files to verify functionality:

1. **TEST_DOCUMENT.md** - Sample document with various heading levels
2. **test-extraction.html** - Browser-based extraction testing
3. **debug-extraction.ts** - Standalone extraction testing

### 📞 Getting Help

If the issue persists:

1. **Collect Debug Info**:
   - Console output from "Debug TOC Extraction"
   - Obsidian version
   - Plugin version
   - Sample document structure

2. **Check Browser Compatibility**:
   - Ensure IntersectionObserver is supported
   - Check for JavaScript errors

3. **Verify Plugin Installation**:
   - Plugin is enabled in Obsidian settings
   - No conflicting plugins
   - Plugin files are properly loaded

### 🎯 Success Indicators

The plugin is working correctly when:
- ✅ TOC appears with document headings
- ✅ Active section highlighting works while scrolling
- ✅ Clicking TOC items navigates to sections
- ✅ TOC updates when switching documents
- ✅ No console errors during operation