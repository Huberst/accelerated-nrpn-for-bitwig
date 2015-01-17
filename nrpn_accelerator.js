var NRPNaccelerator = {
    // commands
    commands: {
        selectSender: 99,
        inc: 96,
        dec: 97,
    },

    // up to this duration of ms, acceleration is applyed
    maxMsPassed: 25,

    // id of the last sender sent with the MSB
    lastSender: undefined,

    // senders moments for factor calculation
    prevMoments: {},

    // previous values to smooth out the following
    prevValues: {},

    /**
     * Just pass data1 and data2 from your scripts onMidi callback through this function.
     * If the midi is nrpn and MSB, the value is used to store the knobs id as "lastSender".
     * If it is nrpn and "Data Increment" or "Data Decrement" the valueChangeCallback
     * is called with the lastSender and the accelerated value change.
     * @param  {integer}
     * @param  {integer}
     * @param  {function}
     */
    accelerate: function(data1, data2, valueChangeCallback) {
        // select sender
        if (data1 === this.commands.selectSender && data2 !== this.lastSender) {
            this.lastSender = data2;
        }
        // increase
        if (data1 === this.commands.inc) {
            valueChangeCallback(this.lastSender, this.acceleratedValue());
        }
        // decrease
        if (data1 === this.commands.dec) {
            valueChangeCallback(this.lastSender, this.acceleratedValue() * -1);
        }
    },

    /**
     * calculates the accelerated value change for the current sender
     * by using the time difference between the last to increase or decrease signals
     * as the factor.
     * @return {[type]}
     */
    acceleratedValue: function() {

        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var ms = date.getMilliseconds();

        var moment = (hours*60*60*1000) + (minutes*60*1000) + (seconds*1000) + ms;
        var msPassed = moment - this.prevMoments[this.lastSender] || this.maxMsPassed;

        var x = msPassed;
        var accValue = x > this.maxMsPassed ? 1 : -(7*x*x*x -510*x*x +12575*x -120000) / 15000;

        // try to smooth out accelerated value with prevValue
        if (accValue > 1 && this.prevValues[this.lastSender]) {
            accValue = (accValue + this.prevValues[this.lastSender]) / 2;
        }
        this.prevValues[this.lastSender] = accValue;

        this.prevMoments[this.lastSender] = moment;
        return accValue;
    }

};