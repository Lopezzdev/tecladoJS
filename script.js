//Declaración de variables
let i,j,k;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const sampleRate = audioCtx.sampleRate; // Típicamente 44100

let frecuencia=65.4; octava=1;cantCiclos=1;
let indiceOnda=0,indiceEnv=0;
let cantSources=50;

let boolEnv=false,boolAmp1=false,boolLow1=false,habLow1=false,boolHigh1=false,habHigh1=false;
let amp1=[0.01,1,0.5,0.5,0.5],maxAmps=[10,10,1,10,1];boolCustom=false;
let filtroLow1=[1,1,0.3,0.5,1500,10],maxFiltros=[10,10,1,10,10000,20];
let filtroHigh1=[1,1,0.3,0.5,1500,10];
//   Ataque,decay,sustain,release,frecuencia,resonancia

//Variables ecualizador
let indiceEcu=null;
let frecuenciaAux=20000,valorQaux=10,cantidadFiltros=4;
let filtros=[],boolFiltros=[0,0,0,0],Xfiltros=[100,250,500,600],Yfiltros=[80,160,20,101],freqFiltros=[],dBFiltros=[],Qfiltros=[0,1,5,0],xEcu,yEcu,qEcu;

let guias=[93,163,326,397,560,630];
let textoGuias=["50","100","500","1k","5k","10k"];

let letras=["q","2","w","3","e","r","5","t","6","y","7","u","z","s","x","d","c","v","g","b","h","n","j","m",","];
let letras2=["i","9","o","0","p","Dead","¿","+","Backspace","Enter","Insert","Delete","End"];

let canvasTeclado = document.querySelector("#teclado");
let ctxTeclado = canvasTeclado.getContext("2d");
let canvasAmp = document.querySelector("#env");
let ctxAmp = canvasAmp.getContext("2d");
let canvasCustom = document.querySelector("#custom");
let ctxCustom = canvasCustom.getContext("2d");
let canvasAncho = document.querySelector("#ancho");
let ctxAncho = canvasAncho.getContext("2d");
let canvasEcu = document.querySelector("#ecu");
let ctxEcu = canvasEcu.getContext("2d");

let canvasDebug = document.querySelector("#canvaPrueba");
let ctxDebug = canvasDebug.getContext("2d");

let cantArmonicos=100,anchoColumna=(canvasCustom.width-2)/cantArmonicos,cantArmonicosRandom;
let armonicosCustom=[],armonicosRandom=[];

let anchoCuadrada=100,coefAncho=100/anchoCuadrada;

for(i=0;i<cantArmonicos;i++){armonicosCustom[i]=0;}

cantArmonicosRandom=Math.round(Math.random()*cantArmonicos);
for(i=0;i<cantArmonicosRandom;i++)armonicosRandom[i]=Math.random();
for(i=cantArmonicosRandom;i<cantArmonicos;i++)armonicosRandom[i]=0;

let matrizRuido=[];
for(i=0;i<sampleRate;i++)matrizRuido[i]=Math.random() * 0.4 - 0.2;

//Crear la matriz con todas las notas
let arrayRelaciones=[1,1.059,1.122,1.189,1.26,1.335,1.414,1.498,1.587,1.682,1.782,1.888,2];
let arrayRelaciones2=[0.707,0.749,0.793,0.841,0.891,0.944,1,1.059,1.122,1.189,1.26,1.335];
for(i=0;i<13;i++){arrayRelaciones[i+12]=arrayRelaciones[i]*2;}
for(i=0;i<25;i++){arrayRelaciones2[i+12]=arrayRelaciones2[i]*2;}

let largosOnda=[];
let matrizNotas=[];
let sources=[];
let ganancias=[],filtrosLow=[],filtrosHigh=[];
let sonando=[],apretando=[];
let coef=[];

function crearArrays(){  

  silenciar();

  for(i=0;i<arrayRelaciones.length;i++){
    largosOnda[i]=cantCiclos*sampleRate/(frecuencia*Math.pow(2,octava)*arrayRelaciones[i]);
    
    coef[i]=largosOnda[i]/(Math.round(largosOnda[i]));
    largosOnda[i]=Math.round(largosOnda[i]);   
  }

  for(i=0;i<cantSources;i++){
    sources[i]=audioCtx.createBufferSource();
    ganancias[i]=audioCtx.createGain();
    filtrosLow[i]=audioCtx.createBiquadFilter();
    filtrosHigh[i]=audioCtx.createBiquadFilter();
    sonando[i]=false;
    apretando[i]=0;
  }

  for(i=0;i<cantSources;i++){
    filtros[i]=[];
    for(j=0;j<cantidadFiltros;j++){
      filtros[i][j]=audioCtx.createBiquadFilter();
      
      t = Math.min(Math.max(Xfiltros[i] / 700, 0), 1);
      freqFiltros[i]=Math.round(20 * Math.pow(20000 / 20, t));
      dBFiltros[i]=20-Yfiltros[i]/6;
    }
  }

  for(i=0;i<arrayRelaciones.length;i++){
    matrizNotas[i]=new Float32Array(Math.round(largosOnda[i]));
  }

  switch(indiceOnda){
    case 0:crearOndaSeno();break;
    case 1:crearOndaCuadrada();break;
    case 2:crearOndaTriangular();break;
    case 3:crearRandom();break;
    case 4:crearRuido();break;
    case 5:crearCustom();break;
  }

  muestreo();
  muestreoDebug();

}

crearArrays();

//Crear ondas
function crearOndaSeno(){
  for(j=0;j<arrayRelaciones.length;j++){
    for(i=0;i<largosOnda[j];i++){
      matrizNotas[j][i]=Math.sin(2*Math.PI*frecuencia*arrayRelaciones[j]*coef[j]*(Math.pow(2,octava))*(i+1)/sampleRate)*0.4*amp1[4];
    }
  }
}

function crearOndaCuadrada(){
  for(j=0;j<arrayRelaciones.length;j++){
    for(i=0;i<largosOnda[j];i++){
      // if(i>(largosOnda[j]/(2)))matrizNotas[j][i]=0.2*amp1[4];
      if(i>(largosOnda[j]/(2*coefAncho)))matrizNotas[j][i]=0.2*amp1[4];
      else matrizNotas[j][i]=-0.2*amp1[4];
    }
  }
}

function crearOndaTriangular(){
  for(j=0;j<arrayRelaciones.length;j++){
    for(i=0;i<largosOnda[j];i++){
      matrizNotas[j][i]=(2*i/largosOnda[j]-1)*0.2*amp1[4];
    }
  }
}

function crearRandom(){
    
  for(j=0;j<arrayRelaciones.length;j++){

    for(i=0;i<largosOnda[j];i++){

      matrizNotas[j][i]=0;

      for(k=0;k<cantArmonicos;k++){
        matrizNotas[j][i]-=Math.sin(2*(k+1)*Math.PI*frecuencia*arrayRelaciones[j]*coef[j]*(Math.pow(2,octava))*(i+1)/sampleRate)*(armonicosRandom[k]*0.4*amp1[4]/(k+1));
      }
    }
    
  }

  muestreoEnv1();
  
}

function crearRuido(){
  for(j=0;j<arrayRelaciones.length;j++){
    matrizNotas[j]=new Float32Array(sampleRate);
    largosOnda[j]=sampleRate;
    for(i=0;i<sampleRate;i++){
      matrizNotas[j][i]=matrizRuido[i]*amp1[4];
    }
  }
}

function crearCustom(){
  for(j=0;j<arrayRelaciones.length;j++){

    for(i=0;i<largosOnda[j];i++){

      matrizNotas[j][i]=0;

      for(k=0;k<armonicosCustom.length;k++){
        matrizNotas[j][i]-=Math.sin(2*(k+1)*Math.PI*frecuencia*arrayRelaciones[j]*coef[j]*(Math.pow(2,octava))*(i+1)/sampleRate)*(armonicosCustom[k]*0.4*amp1[4]/(2*(k+1)));
        // matrizNotas[j][i]-=Math.sin(2*(k+1)*Math.PI*frecuencia*arrayRelaciones[j]*coef[j]*(Math.pow(2,octava))*(i+1)/sampleRate)*(armonicosCustom[k]*0.4*amp1[4]);
      }
    }
    
  }
}


//Reproducir
let ahora,src=0,ultimoSource=[];

function reproducir(nota){

  if(sonando[nota]){
    let srcAux2=ultimoSource[nota];
    const t = audioCtx.currentTime;
    ganancias[srcAux2].gain.cancelScheduledValues(t);
    ganancias[srcAux2].gain.setValueAtTime(ganancias[srcAux2].gain.value, t);
    ganancias[srcAux2].gain.linearRampToValueAtTime(0, t + 0.001);

    setTimeout(() => {
      sources[srcAux2].stop();
      muestreo();
    }, 0.001*1000+100);
  }

  try {
  sources[src].disconnect();
  ganancias[src].disconnect();
  filtrosHigh[src].disconnect();
  filtrosLow[src].disconnect();
} catch(e) {}

  ultimoSource[nota]=src;sonando[nota]=true;apretando[nota]=true;
  ahora = audioCtx.currentTime;

  //Creando envolvente de ganancia
  ganancias[src].gain.value = 0;
  ganancias[src].gain.setValueAtTime(0, ahora); //Inicia en 0
  ganancias[src].gain.linearRampToValueAtTime(1, ahora + amp1[0]); //Va al maximo en el tiempo de ataque
  ganancias[src].gain.linearRampToValueAtTime(amp1[2], ahora + amp1[0] + amp1[1]); //Luego del ataque, va al sustain en el tiempo del release

  //Creando envolvente de filtros dinámicos
  let frecuenciaNota=frecuencia*arrayRelaciones[nota]*octava;

  filtrosLow[src].type = "lowpass";
  if(habLow1){
    filtrosLow[src].Q.value = filtroLow1[5];
    filtrosLow[src].frequency.setValueAtTime(frecuenciaNota+10, ahora);
    filtrosLow[src].frequency.linearRampToValueAtTime(frecuenciaNota+filtroLow1[4], ahora + filtroLow1[0]);  
    filtrosLow[src].frequency.linearRampToValueAtTime(frecuenciaNota+filtroLow1[4]*filtroLow1[2], ahora + filtroLow1[0] + filtroLow1[1]);
  }else{filtrosLow[src].Q.value = 1;filtrosLow[src].frequency.value=20000;}
  
  filtrosHigh[src].type = "highpass";
  if(habHigh1){
    filtrosHigh[src].Q.value = filtroHigh1[5];
    filtrosHigh[src].frequency.setValueAtTime(frecuenciaNota+10, ahora);
    filtrosHigh[src].frequency.linearRampToValueAtTime(frecuenciaNota+filtroHigh1[4], ahora + filtroHigh1[0]);  
    filtrosHigh[src].frequency.linearRampToValueAtTime(frecuenciaNota+filtroHigh1[4]*filtroHigh1[2], ahora + filtroHigh1[0] + filtroHigh1[1]);
  }
  else{filtrosHigh[src].Q.value = 1;filtrosHigh[src].frequency.value=0;}

  //Creando envolvente de filtros fijos
  filtros[src][0] = audioCtx.createBiquadFilter();
  filtros[src][1] = audioCtx.createBiquadFilter();
  filtros[src][2] = audioCtx.createBiquadFilter();
  filtros[src][3] = audioCtx.createBiquadFilter();

  filtros[src][0].type="highpass";
  filtros[src][0].Q.value=dBFiltros[0];
  filtros[src][0].frequency.value=freqFiltros[0];

  filtros[src][1].type="peaking";
  filtros[src][1].Q.value=Qfiltros[1];
  filtros[src][1].gain.value=dBFiltros[1];
  filtros[src][1].frequency.value=freqFiltros[1];
  
  filtros[src][2].type="peaking";
  filtros[src][2].Q.value=Qfiltros[2];
  filtros[src][2].gain.value=dBFiltros[2];
  filtros[src][2].frequency.value=freqFiltros[2];
  
  filtros[src][3].type="lowpass";
  filtros[src][3].Q.value=dBFiltros[3];
  filtros[src][3].frequency.value=freqFiltros[3];
  if(!boolFiltros[0]){filtros[src][0].Q.value=0;filtros[src][0].frequency.value=0;}
  if(!boolFiltros[1]){filtros[src][1].gain.value=0;}
  if(!boolFiltros[2]){filtros[src][2].gain.value=0;}
  if(!boolFiltros[3]){filtros[src][3].Q.value=0;filtros[src][3].frequency.value=48000;}

  let buffer = audioCtx.createBuffer(1, largosOnda[nota], sampleRate);
  buffer.copyToChannel(matrizNotas[nota], 0);

  sources[src]= audioCtx.createBufferSource();
  sources[src].loop=true;
  sources[src].buffer = buffer;

  sources[src].connect(ganancias[src]).connect(filtrosHigh[src]).connect(filtros[src][0]).connect(filtros[src][1]).connect(filtros[src][2]).connect(filtros[src][3]).connect(filtrosLow[src]).connect(audioCtx.destination);
  // sources[src].connect(ganancias[src]).connect(filtrosHigh[src]).connect(filtrosLow[src]).connect(audioCtx.destination);

  sources[src].start();

  src++;
  if(src>=sources.length){src=0;}

}

//Detener
function detener(nota){

  let srcAux=ultimoSource[nota];

  apretando[nota]=false;

  const t = audioCtx.currentTime;
  ganancias[srcAux].gain.cancelScheduledValues(t);
  ganancias[srcAux].gain.setValueAtTime(ganancias[srcAux].gain.value, t);
  ganancias[srcAux].gain.linearRampToValueAtTime(0, t + amp1[3]);

  setTimeout(() => {
    try{
      sonando[nota]=false;
      sources[srcAux].stop();
      muestreo();
    }catch{}
    }, amp1[3]*1000);
}

//Mostrar teclado
function muestreo(){

  let posX=3,posX2=33;
  for(i=0;i<25;i++){
    if(i==0||i==2||i==4||i==5||i==7||i==9||i==11||i==12||i==14||i==16||i==17||i==19||i==21||i==23||i==24){

      if(!apretando[i])ctxTeclado.fillStyle="rgba(131, 131, 131, 1)";
      else ctxTeclado.fillStyle="rgba(85, 85, 85, 1)";

      ctxTeclado.fillRect(posX, 3, 47, 200);

      ctxTeclado.fillStyle="rgba(255, 255, 255, 0.5)";
      ctxTeclado.fillRect(posX+43,3,4,200);

      posX+=50;

    }
  }

  for(i=0;i<25;i++){
    if(i==1||i==3||i==6||i==8||i==10||i==13||i==15||i==18||i==20||i==22){
      if(i==6||i==13||i==18)posX2+=50;

      if(!apretando[i])ctxTeclado.fillStyle="black";
      else ctxTeclado.fillStyle="rgba(61, 61, 61, 1)";

      ctxTeclado.fillRect(posX2, 3, 37, 120);

      ctxTeclado.fillStyle="rgba(255, 255, 255, 0.6)";
      ctxTeclado.fillRect(posX2+33,3,4,120);

      posX2+=50;
    }
  }

}

//Mostrar custom
function mostrarCustom(){

  if((indiceOnda==5||indiceOnda==3)){
    document.querySelector("#custom").style.cssText="top:-202px;transition:top 0.5s;";
    document.querySelector("#env").style.cssText="top:0px;transition:top 0.5s;";
    document.querySelector("#ecu").style.cssText="top:0px;transition:top 0.5s;";
    indiceEnv=0;
    document.querySelector("#refrescar").style.cssText="top:-180px;left:-20px;transition:top 0.5s,left 0.5s;";
  }else{
    document.querySelector("#custom").style.cssText="top:0px;transition:top 0.5s;";
    if(indiceEnv==0)document.querySelector("#refrescar").style.cssText="top:0px;left:40px;transition:top 0.5s,left 0.5s;";
  }

  ctxCustom.clearRect(0,0,canvasCustom.width,canvasCustom.height);

  ctxCustom.fillStyle = "rgb(48,48,48)";
  for(i=0;i<cantArmonicos;i++){
      ctxCustom.fillRect(i*anchoColumna+2, 2, anchoColumna-1, canvasCustom.height-4);
  }

  let alto=canvasCustom.height-4;

  ctxCustom.fillStyle = "rgba(122, 31, 31, 0.6)";
  for(i=0;i<cantArmonicos;i++){
      if(indiceOnda==5)ctxCustom.fillRect(i*anchoColumna+2, alto+2, anchoColumna-1, -armonicosCustom[i]*alto);
      if(indiceOnda==3) ctxCustom.fillRect(i*anchoColumna+2, alto+2, anchoColumna-1, -armonicosRandom[i]*alto);
  }

  mostrarAncho();

}

document.querySelector("#refrescar").addEventListener("mousedown",()=>{
  if(indiceOnda==5&&indiceEnv==0){for(i=0;i<cantArmonicos;i++)armonicosCustom[i]=0;mostrarCustom();}
  if(indiceOnda==3&&indiceEnv==0){
    armonicosRandom.splice(0,armonicosRandom.length);
    cantArmonicosRandom=Math.round(Math.random()*cantArmonicos);
    for(i=0;i<cantArmonicosRandom;i++)armonicosRandom[i]=Math.random();
    for(i=cantArmonicosRandom;i<cantArmonicos;i++)armonicosRandom[i]=0;
    mostrarCustom();crearArrays();
  }
  if(indiceEnv==1){
    amp1[0]=0.005+Math.random()*2;
    if(amp1[0]<1)amp1[0]=parseFloat(amp1[0].toFixed(3));
    amp1[1]=0.005+Math.random()*2;
    if(amp1[1]<1)amp1[1]=parseFloat(amp1[1].toFixed(3));
    amp1[2]=Math.random();
    amp1[2]=parseFloat(amp1[2].toFixed(2));
    amp1[3]=0.005+Math.random()*2;
    if(amp1[3]<1)amp1[3]=parseFloat(amp1[3].toFixed(3));
  }
  if(indiceEnv==2){
    filtroLow1[0]=0.005+Math.random()*2;
    if(filtroLow1[0]<1)filtroLow1[0]=parseFloat(filtroLow1[0].toFixed(3));
    filtroLow1[1]=0.005+Math.random()*2;
    if(filtroLow1[1]<1)filtroLow1[1]=parseFloat(filtroLow1[1].toFixed(3));
    filtroLow1[2]=Math.random();
    filtroLow1[2]=parseFloat(filtroLow1[2].toFixed(2));
    filtroLow1[3]=0.005+Math.random()*2;
    if(filtroLow1[3]<1)filtroLow1[3]=parseFloat(filtroLow1[3].toFixed(3));
    filtroLow1[4]=Math.random()*10000;
    filtroLow1[5]=Math.random()*15;
  }
  if(indiceEnv==3){
    filtroHigh1[0]=0.005+Math.random()*2;
    if(filtroHigh1[0]<1)filtroHigh1[0]=parseFloat(filtroHigh1[0].toFixed(3));
    filtroHigh1[1]=0.005+Math.random()*2;
    if(filtroHigh1[1]<1)filtroHigh1[1]=parseFloat(filtroHigh1[1].toFixed(3));
    filtroHigh1[2]=Math.random();
    filtroHigh1[2]=parseFloat(filtroHigh1[2].toFixed(2));
    filtroHigh1[3]=0.005+Math.random()*2;
    if(filtroHigh1[3]<1)filtroHigh1[3]=parseFloat(filtroHigh1[3].toFixed(3));
    filtroHigh1[4]=Math.random()*10000;
    filtroHigh1[5]=Math.random()*15;
  }
  if(indiceEnv==4){
    boolFiltros=[0,0,0,0];
    Xfiltros=[100,250,500,600];
    Yfiltros=[101,101,101,101];
    Qfiltros=[0,1,1,0];
    clickEcu();
  }

  muestreoEnv1();

})

let trans=0,delaySt;
function transponer(st){

  try{clearTimeout(delaySt);}catch{}

  trans+=st;
  if(trans<-6)trans=-6;
  if(trans>6)trans=6;
  
  for(i=0;i<arrayRelaciones.length;i++)arrayRelaciones[i]=arrayRelaciones2[i+6+trans];
  
  if(trans<=0)document.querySelector("#trans").innerHTML=`${trans} st`;
  else document.querySelector("#trans").innerHTML=`+${trans} st`;

  document.querySelector("#trans").style.cssText="top:-30px;transition:top 0.2s;";

  delaySt=setTimeout(() => {
    document.querySelector("#trans").style.cssText="top:0px;transition:top 0.5s;";
  }, 2000);

  crearArrays();

}

function mostrarAncho(){
  if(indiceOnda==1)document.querySelector("#ancho").style.cssText="left:-40px;transition:left 0.5s;";
  else document.querySelector("#ancho").style.cssText="left:10px;transition:left 0.5s;";
}

let patronPiano=[0,1,2,1,0,0,1,2,1,2,1,0,0,1,2,1,0,0,1,2,1,2,1,0,0];
function clickear(){
    
  let rect = canvasTeclado.getBoundingClientRect();

  let mouseX = event.clientX - rect.left;
  let mouseY = event.clientY - rect.top;

  let nota;
  let XX=0,XXaux=0;
  
  if(mouseY>123){
    nota=Math.floor(mouseX/50)*2;
    if(nota>5)nota--;
    if(nota>12)nota--;
    if(nota>17)nota--;
    if(nota>23)nota--;
  }else{
    for(i=0;i<patronPiano.length;i++){

      XXaux=XX;

      switch (patronPiano[i]){
        case 0: XX+=31;break;
        case 1: XX+=37;break;
        case 2: XX+=13;break;
      }

      if(mouseX>=XXaux+2&&mouseX<XX+2)nota=i;

    }
  }

  if(mouseX>701)nota=24;
  if(mouseX<10)nota=0;


  reproducir(nota);

  muestreo();

}

function silenciar(){
    for(i=0;i<sources.length;i++){
      try{
      detener(i);
      sonando[i]=false;
      }catch{}
    }  
  muestreo();
}

//Canvas Amp1
let triggerAmp1=false,posX,posY;

muestreoEnv1();

function muestreoEnv1(){
  ctxAmp.clearRect(0,0,canvasAmp.width,canvasAmp.height);
  ctxAmp.font="16px arial";
  let ancho,total=580;
  ctxAmp.fillStyle="rgba(48, 48, 48, 1)";

  if(indiceEnv<4){
    for(i=0;i<6;i++){
      ctxAmp.fillRect(2,20*i+2,total,18);
    }
  }

  if(indiceEnv==1){
    ctxAmp.fillStyle="rgba(122, 31, 31, 0.6)";
    for(i=0;i<5;i++){
      ancho=total/(maxAmps[i]/amp1[i]);
      ctxAmp.fillRect(2,20*i+2,ancho,18);
    }

    if(amp1[0]<1)ctxAmp.fillText(`Ataque: ${Math.round(amp1[0]*1000)}ms`, 585, 16);
    else ctxAmp.fillText(`Ataque: ${(amp1[0]).toFixed(2)}s`, 585, 16);
    if(amp1[1]<1)ctxAmp.fillText(`Decay: ${Math.round(amp1[1]*1000)}ms`, 585, 36);
    else ctxAmp.fillText(`Decay: ${(amp1[1]).toFixed(2)}s`, 585, 36);
    ctxAmp.fillText(`Sustain: ${amp1[2].toFixed(2)}`, 585, 56);
    if(amp1[3]<1)ctxAmp.fillText(`Release: ${Math.round(amp1[3]*1000)}ms`, 585, 76);
    else ctxAmp.fillText(`Release: ${(amp1[3]).toFixed(2)}s`, 585, 76);
    ctxAmp.fillText(`Volumen: ${Math.round(amp1[4]*100)}`, 585, 96);
  }
  if(indiceEnv==2){
    ctxAmp.fillStyle="rgba(122, 31, 31, 0.6)";
    for(i=0;i<6;i++){
      ancho=total/(maxFiltros[i]/filtroLow1[i]);
      ctxAmp.fillRect(2,20*i+2,ancho,18);
    }

    if(filtroLow1[0]<1)ctxAmp.fillText(`Ataque: ${Math.round(filtroLow1[0]*1000)}ms`, 585, 16);
    else ctxAmp.fillText(`Ataque: ${(filtroLow1[0]).toFixed(2)}s`, 585, 16);
    if(filtroLow1[1]<1)ctxAmp.fillText(`Decay: ${Math.round(filtroLow1[1]*1000)}ms`, 585, 36);
    else ctxAmp.fillText(`Decay: ${(filtroLow1[1]).toFixed(2)}s`, 585, 36);
    ctxAmp.fillText(`Sustain: ${filtroLow1[2].toFixed(2)}`, 585, 56);
    if(filtroLow1[3]<1)ctxAmp.fillText(`Release: ${Math.round(filtroLow1[3]*1000)}ms`, 585, 76);
    else ctxAmp.fillText(`Release: ${(filtroLow1[3]).toFixed(2)}s`, 585, 76);
    ctxAmp.fillText(`Freq: ${Math.round(filtroLow1[4])}Hz`, 585, 96);
    ctxAmp.fillText(`Res: ${Math.round(filtroLow1[5])}`, 585, 116);
    
    ctxAmp.fillText(`Habilitar lowpass`, 4, 136);
    ctxAmp.fillRect(135,123,16,16);
    if(!habLow1){
     ctxAmp.fillStyle="rgba(12,12,12,1)";
     ctxAmp.fillRect(136,124,14,14);
    }

  }
  if(indiceEnv==3){
    ctxAmp.fillStyle="rgba(122, 31, 31, 0.6)";
    for(i=0;i<6;i++){
      ancho=total/(maxFiltros[i]/filtroHigh1[i]);
      ctxAmp.fillRect(2,20*i+2,ancho,18);
    }

    if(filtroHigh1[0]<1)ctxAmp.fillText(`Ataque: ${Math.round(filtroHigh1[0]*1000)}ms`, 585, 16);
    else ctxAmp.fillText(`Ataque: ${(filtroHigh1[0]).toFixed(2)}s`, 585, 16);
    if(filtroHigh1[1]<1)ctxAmp.fillText(`Decay: ${Math.round(filtroHigh1[1]*1000)}ms`, 585, 36);
    else ctxAmp.fillText(`Decay: ${(filtroHigh1[1]).toFixed(2)}s`, 585, 36);
    ctxAmp.fillText(`Sustain: ${filtroHigh1[2].toFixed(2)}`, 585, 56);
    if(filtroHigh1[3]<1)ctxAmp.fillText(`Release: ${Math.round(filtroHigh1[3]*1000)}ms`, 585, 76);
    else ctxAmp.fillText(`Release: ${(filtroHigh1[3]).toFixed(2)}s`, 585, 76);
    ctxAmp.fillText(`Freq: ${Math.round(filtroHigh1[4])}Hz`, 585, 96);
    ctxAmp.fillText(`Res: ${Math.round(filtroHigh1[5])}`, 585, 116);
    
    ctxAmp.fillText(`Habilitar highpass`, 4, 136);
    ctxAmp.fillRect(135,123,16,16);
    if(!habHigh1){
     ctxAmp.fillStyle="rgba(12,12,12,1)";
     ctxAmp.fillRect(136,124,14,14);
    }

  }

}

function clickEnv1(){

  let total=580;
  let posCanvas = canvasAmp.getBoundingClientRect();
  
  posX=Math.floor(event.clientX-posCanvas.left);

  if(!triggerAmp1){

    posY=Math.floor(event.clientY-posCanvas.top);

    if(posX>=135&&posX<=151&&posY>=123&&posY<=139){
      if(indiceEnv==2)habLow1=!habLow1;
      if(indiceEnv==3)habHigh1=!habHigh1;
      muestreoEnv1();
      document.querySelector("#env").removeEventListener("mousemove",clickEnv1);
      triggerAmp1=true;
      return;
    }

    posY=Math.floor(posY/20);
    
  }
  triggerAmp1=true;

  if(indiceEnv==1){
    posX=posX*maxAmps[posY]/total;
    if(posY<5)amp1[posY]=posX;
  }
  if(indiceEnv==2){
    posX=posX*maxFiltros[posY]/total;
    if(posY<6)filtroLow1[posY]=posX;
  }
  if(indiceEnv==3){
    posX=posX*maxFiltros[posY]/total;
    if(posY<6)filtroHigh1[posY]=posX;
  }

  if(amp1[0]<0.005)amp1[0]=0.005;
  if(amp1[1]<0.005)amp1[1]=0.005;
  if(amp1[3]<0.005)amp1[3]=0.005;
  if(amp1[0]>10)amp1[0]=10;
  if(amp1[1]>10)amp1[1]=10;
  if(amp1[3]>10)amp1[3]=10;
  if(amp1[2]>1)amp1[2]=1;
  if(amp1[2]<0)amp1[2]=0;
  if(amp1[4]<0)amp1[4]=0;
  if(amp1[4]>1)amp1[4]=1;

  if(filtroLow1[0]<0)filtroLow1[0]=0;
  if(filtroLow1[1]<0.005)filtroLow1[1]=0.005;
  if(filtroLow1[3]<0.005)filtroLow1[3]=0.005;
  if(filtroLow1[0]>10)filtroLow1[0]=10;
  if(filtroLow1[1]>10)filtroLow1[1]=10;
  if(filtroLow1[3]>10)filtroLow1[3]=10;
  if(filtroLow1[2]>1)filtroLow1[2]=1;
  if(filtroLow1[2]<0)filtroLow1[2]=0;
  if(filtroLow1[4]<0)filtroLow1[4]=0;
  if(filtroLow1[4]>10000)filtroLow1[4]=10000;
  if(filtroLow1[5]>20)filtroLow1[5]=20;

  if(filtroHigh1[0]<0)filtroHigh1[0]=0;
  if(filtroHigh1[1]<0.005)filtroHigh1[1]=0.005;
  if(filtroHigh1[3]<0.005)filtroHigh1[3]=0.005;
  if(filtroHigh1[0]>10)filtroHigh1[0]=10;
  if(filtroHigh1[1]>10)filtroHigh1[1]=10;
  if(filtroHigh1[3]>10)filtroHigh1[3]=10;
  if(filtroHigh1[2]>1)filtroHigh1[2]=1;
  if(filtroHigh1[2]<0)filtroHigh1[2]=0;
  if(filtroHigh1[4]<0)filtroHigh1[4]=0;
  if(filtroHigh1[4]>10000)filtroHigh1[4]=10000;
  if(filtroHigh1[5]>20)filtroHigh1[5]=20;

  crearArrays();
  muestreoEnv1();

}


let triggerCustom=false,posX2,posY2;
function clickCustom(){

  let posCanvas = canvasCustom.getBoundingClientRect();

  posY2=1+(posCanvas.top-event.clientY)/(canvasCustom.height);
  posY2=parseFloat(posY2.toFixed(2));

  if(!triggerCustom){
    posX2=(event.clientX-posCanvas.left-2)/anchoColumna;
    posX2=Math.floor(posX2);
    if(posX2<0)posX2=0;
    if(posX2>cantArmonicos)posX2=cantArmonicos;
  }
  triggerCustom=true;

  if(indiceOnda==3)armonicosRandom[posX2]=posY2;
  else armonicosCustom[posX2]=posY2;

  mostrarCustom();

}

let posY3=-192;
muestreoAncho();


function muestreoAncho(){
  ctxAncho.clearRect(0,0,canvasAncho.width,canvasAncho.height);
  ctxAncho.font="16px arial";

  ctxAncho.fillStyle="rgba(48, 48, 48, 1)";
  ctxAncho.fillRect(5,5,20,192);

  ctxAncho.fillStyle="rgba(122, 31, 31, 0.6)";
  ctxAncho.fillRect(5,197,20,posY3);

}

function clickAncho(){

  let posCanvas = canvasAncho.getBoundingClientRect();

  posY3=Math.floor(event.clientY-posCanvas.bottom);
  if(posY3<-192)posY3=-192;
  if(posY3>-5)posY3=-5;
  anchoCuadrada=-posY3/1.92;
  coefAncho=100/anchoCuadrada;

  crearArrays();
  muestreoAncho();

}

function muestreoEcu(){
  
  let x,y;

  ctxEcu.clearRect(0,0,canvasEcu.width,canvasEcu.height);

  ctxEcu.fillStyle="rgba(150, 150, 150, 1)";
  ctxEcu.font = '10px arial';

  ctxEcu.strokeStyle="rgba(119, 119, 119, 1)";
  ctxEcu.lineWidth=0.5;

  ctxEcu.beginPath();

  ctxEcu.moveTo(0,101);
  ctxEcu.lineTo(702,101);

  for(i=0;i<guias.length;i++){
    ctxEcu.moveTo(guias[i],2);
    ctxEcu.lineTo(guias[i],200);
  }
  ctxEcu.stroke();
  for(i=0;i<guias.length;i++){
    ctxEcu.clearRect(guias[i]-20,185,40,20);
    ctxEcu.fillText(`${textoGuias[i]}`, guias[i]-(5*textoGuias[i].length)+5, 197);
  }


  ctxEcu.beginPath();

  if(boolFiltros[0]){ctxEcu.strokeStyle="rgb(110, 20, 20)";ctxEcu.lineWidth=4;}
  else{ctxEcu.strokeStyle="rgba(122, 122, 122, 1)";ctxEcu.lineWidth=1;}
  
  x=Xfiltros[0],y=Yfiltros[0];
  ctxEcu.moveTo(x-50,210);
  if(y<100)ctxEcu.quadraticCurveTo(x-30, y, x, y);
  else ctxEcu.quadraticCurveTo(x-30, y+(y-100)*2, x, y);
  ctxEcu.bezierCurveTo(x+20, y,x+30,100, x+80, 101);
  ctxEcu.lineTo(702,101);
  ctxEcu.stroke();

  ctxEcu.beginPath();

  if(boolFiltros[1]){ctxEcu.strokeStyle="rgb(110,20,20)";ctxEcu.lineWidth=4;}
  else{ctxEcu.strokeStyle="rgba(122, 122, 122, 1)";ctxEcu.lineWidth=1;}
  
  x=Xfiltros[1],y=Yfiltros[1];q=Qfiltros[1];
  ctxEcu.moveTo(0,101);
  ctxEcu.lineTo(x-30/q,101);
  ctxEcu.bezierCurveTo(x, 101,x-1/q,y, x, y);
  ctxEcu.bezierCurveTo(x+1/q, y,x,101, x+30/q, 101);
  ctxEcu.lineTo(702,101);
  ctxEcu.stroke();

  ctxEcu.beginPath();

  if(boolFiltros[2]){ctxEcu.strokeStyle="rgba(110,20,20)";ctxEcu.lineWidth=4;}
  else{ctxEcu.strokeStyle="rgba(122, 122, 122, 1)";ctxEcu.lineWidth=1;}
  
  x=Xfiltros[2],y=Yfiltros[2];q=Qfiltros[2];
  ctxEcu.moveTo(0,101);
  ctxEcu.lineTo(x-30/q,101);
  ctxEcu.bezierCurveTo(x, 101,x-1/q,y, x, y);
  ctxEcu.bezierCurveTo(x+1/q, y,x,101, x+30/q, 101);
  ctxEcu.lineTo(702,101);
  ctxEcu.stroke();

  ctxEcu.beginPath();

  if(boolFiltros[3]){ctxEcu.strokeStyle="rgb(110, 20, 20)";ctxEcu.lineWidth=4;}
  else{ctxEcu.strokeStyle="rgba(122, 122, 122, 1)";ctxEcu.lineWidth=1;}
  
  x=Xfiltros[3],y=Yfiltros[3];

  ctxEcu.moveTo(x+50,210);

  if(y<100)ctxEcu.quadraticCurveTo(x+30, y, x, y);
  else ctxEcu.quadraticCurveTo(x+30, y+(y-100)*2, x, y);
      
  ctxEcu.bezierCurveTo(x-20, y,x-30,100, x-80, 101);
  ctxEcu.lineTo(0,101);

  ctxEcu.stroke();


  ctxEcu.strokeStyle = "rgba(71, 19, 19, 1)";
  ctxEcu.lineWidth="2";

  ctxEcu.fillStyle="darkred";
  for(i=0;i<cantidadFiltros;i++)ctxEcu.fillRect(Xfiltros[i]-6,Yfiltros[i]-6,12,12);
  ctxEcu.fillStyle="rgba(12,12,12, 1)";
  for(i=0;i<cantidadFiltros;i++)if(!boolFiltros[i])ctxEcu.fillRect(Xfiltros[i]-5,Yfiltros[i]-5,10,10);

}
muestreoEcu();

function clickEcu(){
  let rect = canvasEcu.getBoundingClientRect();

  mouseX=event.clientX - rect.left;
  mouseY=event.clientY - rect.top;

  for(i=0;i<cantidadFiltros;i++){
        if(mouseX>=Xfiltros[i]-6&&mouseX<=Xfiltros[i]+6&&mouseY>=Yfiltros[i]-6&&mouseY<=Yfiltros[i]+6&&indiceEcu==null)indiceEcu=i;
  }

  if(indiceEcu==null)indiceEcu=999;

  if(indiceEcu!=null&&indiceEcu!=999){
      Xfiltros[indiceEcu]=mouseX;Yfiltros[indiceEcu]=mouseY;

      let t = Math.min(Math.max(mouseX / 700, 0), 1);
      frecuenciaAux=Math.round(20 * Math.pow(20000 / 20, t));
      if(boolFiltros[indiceEcu])filtros[src][indiceEcu].frequency.value=frecuenciaAux;
      freqFiltros[indiceEcu]=frecuenciaAux;

      valorQaux=20-mouseY/6;
      if(boolFiltros[indiceEcu]&&(indiceEcu==0||indiceEcu==3))filtros[src][indiceEcu].Q.value=valorQaux;
      if(boolFiltros[indiceEcu]&&(indiceEcu==1||indiceEcu==2))filtros[src][indiceEcu].gain.value=valorQaux;
      dBFiltros[indiceEcu]=valorQaux;
  }

    muestreoEcu();

}






function muestreoDebug(){

  ctxDebug.strokeStyle = "rgba(71, 19, 19, 1)";
  ctxDebug.lineWidth="3";
  ctxDebug.clearRect(0,0,canvasDebug.width,canvasDebug.height);
  ctxDebug.beginPath();

  for(i=0;i<canvasDebug.width;i++){
    let numOnda=Math.floor(i/matrizNotas[0].length);
    ctxDebug.lineTo(i,matrizNotas[0][i-numOnda*matrizNotas[0].length]*200+100);
  }

  ctxDebug.stroke();
}

function funcionDebug1(){
}
function funcionDebug2(){
}
function p(cosa="XD"){
  console.log(cosa);
}