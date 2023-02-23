const { app: nido, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const portAudio = require('naudiodon');
// const { Essentia, EssentiaWASM } = require('essentia.js');
const wav = require('node-wav');

console.log(portAudio.getDevices());
const dispositivos = portAudio.getDevices();
const interfaz = dispositivos.find((dispositivo) => dispositivo.name === 'Scarlett 2i4 USB: Audio (hw:1,0)');
const interfaz2 = dispositivos.find((dispositivo) => dispositivo.name === 'H4: USB Audio (hw:3,0)');

function frame(buffer, frameLength = 512, hopLength = 512) {
  if (buffer.length < frameLength) {
    throw new Error('Buffer is too short for frame length');
  }
  if (hopLength < 1) {
    throw new Error('Hop length cannot be less that 1');
  }
  if (frameLength < 1) {
    throw new Error('Frame length cannot be less that 1');
  }

  const numFrames = 1 + Math.floor((buffer.length - frameLength) / hopLength);

  return new Array(numFrames).fill(0).map((_, i) => buffer.slice(i * hopLength, i * hopLength + frameLength));
}
// const amiguis = new Essentia(EssentiaWASM);
// console.log(amiguis.algorithmNames);
if (interfaz) {
  console.log(interfaz);
  const entrada = new portAudio.AudioIO({
    inOptions: {
      channelCount: 1,
      sampleFormat: portAudio.SampleFormat16Bit,
      sampleRate: 44100,
      deviceId: interfaz.id, // Use -1 or omit the deviceId to select the default device
      closeOnError: true, // Close the stream if an audio error is detected, if set false then just log the error
    },
  });

  function RMS(datos) {
    var rms = 0;
    for (var i = 0; i < datos.length; i++) {
      rms += Math.pow(datos[i], 2);
    }

    rms = rms / datos.length;
    rms = Math.sqrt(rms);

    return rms;
  }

  // const flujo = fs.createWriteStream('cancionlindaAnto.wav');

  // Start piping data and start streaming

  // entrada.pipe(flujo);
  entrada.start();

  entrada.on('data', (buffer) => {
    const datos = new Float32Array(buffer);
    // const victor = amiguis.arrayToVector(datos);
    // const otroVictor = amiguis.BandPass(victor);
    // console.log(otroVictor);

    // const datos = frame(buffer);
    // console.log(datos);
    console.log(RMS(datos));
  });

  // setTimeout(() => {
  //   console.log('Received SIGINT. Stopping recording.');
  //   entrada.quit();
  // }, 5000);
} else {
  console.log('no encontré la cajita roja tan linda que es', ':(');
}

// if (interfaz2) {
//   console.log(interfaz2);
//   const entrada = new portAudio.AudioIO({
//     inOptions: {
//       channelCount: 1,
//       sampleFormat: portAudio.SampleFormat16Bit,
//       sampleRate: 44100,
//       deviceId: interfaz2.id, // Use -1 or omit the deviceId to select the default device
//       closeOnError: true, // Close the stream if an audio error is detected, if set false then just log the error
//     },
//   });

//   console.log(Object.keys(entrada), entrada._events);

//   const flujo = fs.createWriteStream('cancionlindaZoom.wav');

//   // Start piping data and start streaming

//   entrada.pipe(flujo);
//   entrada.start();

//   entrada.on('data', (buffer) => {
//     console.log(buffer);
//   });

//   setTimeout(() => {
//     console.log('Received SIGINT. Stopping recording.');
//     entrada.quit();
//   }, 5000);
// } else {
//   console.log('no encontré la zoomsita', ':(');
// }

function abrirLaVentanita() {
  const ventanita = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'bichofue.js'),
    },
  });

  ventanita.loadFile('vivimos-en-los-cerros.html');
}

nido.whenReady().then(() => {
  abrirLaVentanita();

  nido.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      abrirLaVentanita();
    }
  });
});

nido.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    nido.quit();
  }
});
