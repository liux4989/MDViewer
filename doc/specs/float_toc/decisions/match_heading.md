
# Disovery 
Chats: Disovery Different solutions of headings match(f70baded-5b33-4fdb-bf32-b07c334d5f28)


# Decision
we choose Line-Based Position Tracking to find specific headings 

```typescript
// Use heading.position.start.line and heading.position.end.line
const getCurrentHeading = (scrollLine: number, headings: HeadingCache[]) => {
  return headings.find((heading, index) => {
    const startLine = heading.position.start.line;
    const endLine = index < headings.length - 1 
      ? headings[index + 1].position.start.line - 1
      : Number.MAX_SAFE_INTEGER;
    
    return scrollLine >= startLine && scrollLine <= endLine;
  });
};
```



# Advantages:
More reliable than content matching
Faster performance (O(n) vs content comparison)
No issues with duplicate content across sections