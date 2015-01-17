# accelerated-nrpn-for-bitwig
script to allow fast nrpn value changes with encoders that send less data on fast movements

## How to use
Simply import the script via import() and call the accelerate method with the data1 and data2 parameters from your onMidi callback. As the third parameter pass a function receiving the senderId (that is the value your nrpn sends with the MSB) and the accelerated value to work with.

```javascript
NRPNaccelerator.accelerate(data1, data2, function(senderId, acceleratedVal) {
    // use accelerated value here
});
```
