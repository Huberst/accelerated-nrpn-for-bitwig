# accelerated-nrpn-for-bitwig

## Why I wrote this
With the encoders set to CC mode (Control Change - sending absolute values) on my Akai MPD32, the values skip on changing tracks and devices in Bitwig. I tried to find a way, to set the encoder values on the MPD32 whenever I switch tracks or devices, but couldn't find any *(If this is possible and you know how, please let me know!)*.

Setting the encoders to NRPN so they send relative values (increase or decrease by 1) solves the value jumps, but unfortunately there is a catch!

On top of Akai control scripts that ship with Bitwig, you'll find the following notice:

> encoders can send nrpn, but it's broken. on fast movements, an encoder sends less data, 
> which means, much less and delayed change of parameter values in the app.
> only works like expected when moving encoders very slowly
> -> check nrpn behaviour on apc40

## How does the acceleration work?
All the script does, is messuring the amount of ms that pass between two NRPN Data Increment or Data Decrement messages to calculate the "accelerated" value change according to the following [function](https://www.google.com/?gws_rd=ssl#q=-\(7*x*x*x+-510*x*x+%2B12575*x+-120000\)+%2F+15000). I tried to use the available room to make fast movements feel as "linear" as possible.


## How to use
Simply import the script and call the accelerate method with the data1 and data2 parameters from your onMidi callback. As the third parameter pass a function receiving the senderId (NRPN MSB value) and the accelerated value to work with. This function is called only if the midi message is NRPN Data Increment or Data Decrement.
Of course the encoders you want to accelerate must be set to NRPN mode, using the MSB value as the identifier for your encoder. On my MPD32 I just took the control id the encoder had when it was in CC mode.

```javascript
NRPNaccelerator.accelerate(data1, data2, function(senderId, acceleratedVal) {
    // use accelerated value here, for example like this:
    var knobId = senderId - CC.K1;
    var rangedValue;
    
    if (status === Banks.B || status === Banks.A) {
        rangedValue = primaryDevice.getMacro(knobId).getAmount();
    }
    if (status === Banks.C) {
        rangedValue = cursorDevice.getParameter(knobId);
    }
    // reset on shift else inc by range
    return shiftOn ? rangedValue.reset() : rangedValue.inc(acceleratedVal, 128);
});
```
