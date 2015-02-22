# NumberPool
An object that manages a pool of numbers in a range through the methods allocate and release.

GIANTteacher is the biggest online training service on the planet. They have a highly tuned training delivery system that can handle 10,000,000 concurrent training sessions. Training sessions are all keyed on individual unique numbers. It is the NumberPool's job to act as a sort of load balancer allocating numbers from this pool as fast as students show up to learn. It's absolutely critical that no number is give to two students at the same time. Otherwise, the training process will suffer and the student will experience less than perfect learning. When a student completes their training they can release their unique numbers back into the pool for future students. 

## Installation and Tests
```bash
git clone https://github.com/seank-com/NumberPool.git NumberPool
cd NumberPool
git pull
node NumberPool.tests.js
```
Optionally <a href="https://help.github.com/articles/fork-a-repo/" target="_blank">fork and sync</a> this reprository. If you know how to use wget, you don't need my help to install. (npm install is being considered, see Future Improvements section below)
## Usage
The NumberPool object represents the pool of numbers ranging from one to ten million (1 to 10,000,000). You create a NumberPool by calling the create function on the NumberPoolFactory.
```javascript
var npf = require("./NumberPool.js"),
    np = npf.createNumberPool();
```
The resulting NumberPool object has two methods: allocate and release. When an instance of the NumberPool is instantiated, the object state is such that the range of numbers (1 to 10,000,000) is in the pool. The code can call the allocate method and expect it to succeed immediately after the object is created.

### allocate
The allocate method picks an available value from the pool, removes it from the pool, and returns this value to the caller. If the pool of available numbers is empty, the allocate method returns 0.
```javascript
var n = np.allocate();
```  
The allocate function needs to be fast, students who have to wait to begin training may loss interest and leave before they succeed at learning.

### release
The release method adds an available number value back to the pool. If the value is successfully added back to the pool, release returns true. If the value is already in the pool, then false is returned.
```javascript
if (!np.release(n)) {
  console.log(n + " is already in the NumberPool");
}
```

## Design Considerations
* The implementation of NumberPool needs to be thoughtful and efficient with memory in the average case. An array of 10 million boolean values is not considered efficient with memory. It may be possible for the online traing service to allocate all ten million available numbers from the pool, but this may be an extreme case.

A complete discussion of the design can be found [here](Design.md).

## Future Improvements
* Add installlation through NPM
* Add some form of auto doc feature to keep readme and code comments in sync.
* Investigate better ways testing private closure methods, there feels like a lot of bloat what would otherwise be production source.
* If you have any ideas, submit a pull request!
