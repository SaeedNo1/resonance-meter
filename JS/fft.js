// Minimal FFT implementation (radix-2 Cooley–Tukey)
// Adapted from fft.js (MIT License)

(function(global){
  function FFT(size) {
    if ((size & (size - 1)) !== 0) {
      throw new Error("FFT size must be power of 2");
    }
    this.size = size;
    this._twiddles = new Float32Array(size*2);
    for (let i=0; i<size; i++) {
      const angle = -2*Math.PI*i/size;
      this._twiddles[2*i] = Math.cos(angle);
      this._twiddles[2*i+1] = Math.sin(angle);
    }
  }

  FFT.prototype.createComplexArray = function() {
    return new Float32Array(this.size*2);
  };

  FFT.prototype.realTransform = function(out, data) {
    // pack real input into complex buffer
    for (let i=0; i<this.size; i++) {
      out[2*i] = data[i] || 0;
      out[2*i+1] = 0;
    }
    this.transform(out, out);
  };

  FFT.prototype.transform = function(out, data) {
    const size = this.size;
    // bit-reversal permutation
    let j=0;
    for (let i=0; i<size; i++) {
      if (i<j) {
        const ri = data[2*i], ii = data[2*i+1];
        out[2*i] = data[2*j]; out[2*i+1] = data[2*j+1];
        out[2*j] = ri; out[2*j+1] = ii;
      }
      let m = size>>1;
      while (j>=m && m>=2) { j-=m; m>>=1; }
      j+=m;
    }
    // Danielson–Lanczos
    for (let step=1; step<size; step<<=1) {
      const jump = step<<1;
      const twStep = size/jump;
      for (let group=0; group<step; group++) {
        const wr = this._twiddles[2*group*twStep];
        const wi = this._twiddles[2*group*twStep+1];
        for (let pair=group; pair<size; pair+=jump) {
          const match = pair+step;
          const tr = wr*out[2*match] - wi*out[2*match+1];
          const ti = wr*out[2*match+1] + wi*out[2*match];
          out[2*match] = out[2*pair] - tr;
          out[2*match+1] = out[2*pair+1] - ti;
          out[2*pair] += tr;
          out[2*pair+1] += ti;
        }
      }
    }
  };

  FFT.prototype.completeSpectrum = function(out) {
    // For real FFT, mirror upper half
    const size = this.size;
    for (let i=1; i<size/2; i++) {
      out[2*(size-i)]   = out[2*i];
      out[2*(size-i)+1] = -out[2*i+1];
    }
  };

  // export
  global.FFT = FFT;

})(this);
