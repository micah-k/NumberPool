# NumberPool
An object that manages a pool of numbers in a range through the methods allocate and release.

## Installation and Tests
<a href="https://help.github.com/articles/fork-a-repo/" target="_blank">Fork and sync</a> this reprository or use wget to pull down NumberPool.js and NumberPool.tests.js (npm install comming soon!)
```bash
node NumberPool.tests.js
```
## Usage
The NumberPool object represents the pool of numbers ranging from one to ten million (1 to 10,000,000). You create a NumberPool by calling the create function on the NumberPoolFactory.
```javascript
var npf = require('NumberPool.js).NumberPoolFactory,
    np = npf.create();
```
The resulting NumberPool object has two methods: allocate and release. When an instance of the NumberPool is instantiated, the object state is such that the range of numbers (1 to 10,000,000) is in the pool. The code can call the allocate method and expect it to succeed immediately after the object is created.

The allocate method picks an available value from the pool, removes it from the pool, and returns this value to the caller. If the pool of available numbers is empty, the allocate method returns 0.
```javascript
var n = np.allocate();
```  
The release method adds an available number value back to the pool. If the value is successfully added back to the pool, release returns true. If the value is already in the pool, then false is returned.
```javascript
if (!np.release(n)) {
  console.log(n + " is already in the NumberPool");
}
```  

## Constraints and Assumptions
The implementation of the NumberPool object is wholely contained in a single file.

The NumberPool object expects to be used in node and as such assumes it will run within a single thread.

The implementation of NumberPool needs to be very light and portable so no external packages or dependencies are used.
 
The implementation of NumberPool needs to be thoughtful and efficient with memory in the average case. A solution involving an array of 10 million boolean values is not considered efficient with memory. It may be possible for an application to allocate all ten million available numbers from the pool, but this may be an extreme case.

In the average case, far fewer will be allocated, but the allocation/release call patterns may vary widely.

## Design

At first this problem sounds like a degenerate case of a memory management problem. It's reminiscent of the way Windows used to allocate BSTRings in OLE, using fixed size blocks of MAX_PATH length for all allocations that size and smaller. This is done through what is called a <a href="http://en.m.wikipedia.org/wiki/Memory_pool" target="_blank">Memory pool</a> or fixed-size block allocation. The difference here is that unlike memory management we want to manage a space larger than the memory we manage it in. So drawing some inspiration from <a href="http://en.m.wikipedia.org/wiki/Buddy_memory_allocation" target="_blank">Buddy memory allocation</a>, the first idea is to mantain a sort of <a href="http://en.m.wikipedia.org/wiki/Free_list" target="_blank">free list</a> of ranges.

Lets look at a small sample, say we are managing a NumberPool of 10 numbers. We begin with a single range containing all our numbers.
```
(1,10)->undefined
```
When the user asks for a number we merely adjust the range.
```
1 <= (2,10)->undefined
```
We can keep handing out numbers until we run out. 
```
10 <= (11,10)->undefined
```
When the user gives a number back we either add it to an existing range
```
10 => (10,10)->undefined
9 => (9,10)->undefined
```
or create a new range.
```
5 => (5,5)->(9,10)->undefined
7 => (5,5)->(7,7)->(9,10)->undefined
1 => (1,1)->(5,5)->(7,7)->(9,10)->undefined
```
Remember that we can also add to the end of an existing range as well.
```
2 => (1,2)->(5,5)->(7,7)->(9,10)->undefined
3 => (1,3)->(5,5)->(7,7)->(9,10)->undefined
```
Finally if the user adds a number to an existing range such that two consecutive ranges meet, they can be folded together.
```
4 => (1,5)->(7,7)->(9,10)->undefined
6 => (1,7)->(9,10)->undefined
8 => (1,10)->undefined
```
Allocation can be done in constant time O(1) and release can be done in linear time O(n/2) What's even worse is that the degenerate case allocating all numbers and then releasing all even numbers creates a free list with N/2 ranges, each range contains 2 numbers and a reference to the next range so the size of the degenerate case is conservative 3(N/2). Since an array of size N was explictly forbidden in the constraints this will not do.

http://www.careercup.com/question?id=14491683
http://en.wikipedia.org/wiki/Binary_heap

## Future Improvements

http://www.devthought.com/2012/01/18/an-object-is-not-a-hash/
http://www.w3schools.com/jsref/jsref_number.asp
http://stackoverflow.com/questions/7716812/object-keys-complexity
Memory Management in Javascript
https://hacks.mozilla.org/2012/11/tracking-down-memory-leaks-in-node-js-a-node-js-holiday-season/
https://developer.chrome.com/devtools/docs/memory-analysis-101
http://strongloop.com/strongblog/node-js-performance-tip-of-the-week-memory-leak-diagnosis/
https://developer.chrome.com/devtools/docs/javascript-memory-profiling
http://www.html5rocks.com/en/tutorials/memory/effectivemanagement/
http://javascript.info/tutorial/memory-leaks
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management
