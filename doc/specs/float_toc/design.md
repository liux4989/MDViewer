## Overview
The Obsidian plugin provides a feature: a table of contents component overlay editor view.

## how it works
-  detail mode: provide a page overview to display the article headings
-  easy navigation : click on a heading to jump to it
-  scroll to relative headings: scroll to the heading that is currently in view
-  preview mode : a long-lived tree hierarchy  
-  when hovering the preview mode, it will switch to the detail mode

## how it looks
- an overlay on the middle-left side of the editor
- detail mode will be a scroll list of headings
- preview mode will be a tree hierarchy of lines

## Implementation Detials
- Detailed Mode :
 -- limited width 
 Content-First Approach strategy
 -- Research shows most meaningful headings are 20-60 characters
 -- At 12px font size, roughly 3-4px per character, so 180-240px handles most cases well 
 -- truncation : Long headings are truncated with ellipsis (`...`)
 -- scrollable content : only visible headings show in the limited height
 Golden Ratio & Visual Harmony
 -Follow the 1:3 or 1:4 ratio principle - TOC should be 20-25% of typical editor width

 we will use Content-First Approach strategy first

 -- limited height:
 Cognitive Load Theory
 -- Miller's Rule: 7±2 items in working memory
 -- Show 5-8 headings at once for optimal scanning
 -- At ~20px per item, 150-200px content height is ideal
 -- Viewport Relationship
 -- Should be proportional to available screen height
 -- 20-30% of viewport height feels natural

we will use the congnitive load theory to determine the height of the TOC


-- limited heading depth : only support 3 levels of headings






## Constraints
- tech-stack : React,Uses Obsidian CSS variables, vitest, react motion for animation
- state management : 
    - Start with Context + Hook if global state is small and there is zero dependencies.
	- Switch to Zustand if re-render pain or contexts are multiplying.
- Resources: @Obsidian Docs


