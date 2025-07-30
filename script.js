//Declaración de variables
let i,j,k;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const sampleRate = audioCtx.sampleRate; // Típicamente 44100

let frecuencia=65.4; octava=1;cantCiclos=1;
let indiceOnda=0;

let ataque=0.01,decay=1,sustain=0.5,release=0.5,amp1=[0.01,1,0.5,0.5,0.5],maxAmps=[10,10,1,10,1];boolCustom=false,boolAmp1=false;

let letras=["q","2","w","3","e","r","5","t","6","y","7","u","z","s","x","d","c","v","g","b","h","n","j","m",","];
let letras2=["i","9","o","0","p","Dead","¿","+","Backspace","Enter","Insert","Delete","End"];

let canvasTeclado = document.querySelector("#teclado");
let ctxTeclado = canvasTeclado.getContext("2d");
let canvasAmp = document.querySelector("#amp1");
let ctxAmp = canvasAmp.getContext("2d");
let canvasCustom = document.querySelector("#custom");
let ctxCustom = canvasCustom.getContext("2d");

let canvasDebug = document.querySelector("#canvaPrueba");
let ctxDebug = canvasDebug.getContext("2d");

let cantArmonicos=70,anchoColumna=(canvasCustom.width-2)/cantArmonicos,cantArmonicosRandom;
let armonicosCustom=[],armonicosRandom=[];

for(i=0;i<cantArmonicos;i++){armonicosCustom[i]=0;}

cantArmonicosRandom=Math.round(Math.random()*70);
for(i=0;i<cantArmonicosRandom;i++)armonicosRandom[i]=Math.random();

let matrizRuido=[];
for(i=0;i<48000;i++)matrizRuido[i]=Math.random() * 0.4 - 0.2;

//Crear la matriz con todas las notas
let arrayRelaciones=[1,1.059,1.122,1.189,1.26,1.335,1.414,1.498,1.587,1.682,1.782,1.888,2];
let arrayRelaciones2=[0.707,0.749,0.793,0.841,0.891,0.944,1,1.059,1.122,1.189,1.26,1.335];
for(i=0;i<13;i++){arrayRelaciones[i+12]=arrayRelaciones[i]*2;}
for(i=0;i<25;i++){arrayRelaciones2[i+12]=arrayRelaciones2[i]*2;}

let largosOnda=[];
let matrizNotas=[];
let sources=[];
let ganancias=[];
let sonando=[],apretando=[];
let coef=[];

function crearArrays(){  

  silenciar();
  // mostrarCustom();

  for(i=0;i<arrayRelaciones.length;i++){
    largosOnda[i]=cantCiclos*48000/(frecuencia*Math.pow(2,octava)*arrayRelaciones[i]);
    
    coef[i]=largosOnda[i]/(Math.round(largosOnda[i]));
    largosOnda[i]=Math.round(largosOnda[i]);   
  }

  for(i=0;i<50;i++){
    sources[i]=audioCtx.createBufferSource();
    ganancias[i]=audioCtx.createGain();
    sonando[i]=false;
    apretando[i]=0;
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
      if(i>(largosOnda[j]/2))matrizNotas[j][i]=0.2*amp1[4];
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
  
  // amp1[0]=0.005+Math.random()*2;
  // if(amp1[0]<1)amp1[0]=parseFloat(amp1[0].toFixed(3));
  // amp1[1]=0.005+Math.random()*2;
  // if(amp1[1]<1)amp1[1]=parseFloat(amp1[1].toFixed(3));
  // amp1[2]=Math.random();
  // amp1[2]=parseFloat(amp1[2].toFixed(2));
  // amp1[3]=0.005+Math.random()*2;
  // if(amp1[3]<1)amp1[3]=parseFloat(amp1[3].toFixed(3));
  
  for(j=0;j<arrayRelaciones.length;j++){

    for(i=0;i<largosOnda[j];i++){

      matrizNotas[j][i]=0;

      for(k=0;k<cantArmonicosRandom;k++){
        matrizNotas[j][i]-=Math.sin(2*(k+1)*Math.PI*frecuencia*arrayRelaciones[j]*coef[j]*(Math.pow(2,octava))*(i+1)/sampleRate)*(armonicosRandom[k]*0.4*amp1[4]/(k+1));
      }
    }
    
  }

  muestreoAmp1();
  
}

function crearRuido(){
  for(j=0;j<arrayRelaciones.length;j++){
    matrizNotas[j]=new Float32Array(48000);
    largosOnda[j]=48000;
    for(i=0;i<48000;i++){
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
      }
    }
    
  }
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

//Leer entrada de teclado
document.addEventListener("keydown",(event)=>{
  for(i=0;i<letras.length;i++){
    if(event.key==letras[i]&&!apretando[i])reproducir(i);
  }
  for(i=0;i<letras2.length;i++){
    if(event.key==letras2[i]&&!apretando[i+12])reproducir(i+12);
  }

  // console.log(event.key);

  if(event.key=="ArrowUp"){if(octava<5){octava++;crearArrays();}}
  if(event.key=="ArrowDown"){if(octava>0){octava--;crearArrays();}}
  if(event.key=="ArrowRight"){indiceOnda++;if(indiceOnda>5)indiceOnda=0;mostrarCustom();crearArrays();}
  if(event.key=="ArrowLeft"){indiceOnda--;if(indiceOnda<0)indiceOnda=5;mostrarCustom();crearArrays();}

  muestreo();
})
document.addEventListener("keyup",(event)=>{
  for(i=0;i<letras.length;i++){
    if(event.key==letras[i])detener(i);
  }
  for(i=0;i<letras2.length;i++){
    if(event.key==letras2[i])detener(i+12);
  }
  muestreo();
})

//Reproducir
let ahora,src=0,ultimoSource=[];

function reproducir(nota){

  if(sonando[nota]){
    let srcAux2=ultimoSource[nota];
    const t = audioCtx.currentTime;
    ganancias[srcAux2].gain.cancelScheduledValues(t);
    ganancias[srcAux2].gain.setValueAtTime(ganancias[srcAux2].gain.value, t);
    ganancias[srcAux2].gain.linearRampToValueAtTime(0, t + 0.002);

    setTimeout(() => {
      sources[srcAux2].stop();
      muestreo();
    }, 0.002*1000+200);
  }

  ultimoSource[nota]=src;sonando[nota]=true;apretando[nota]=true;

  //Creando envolvente de ganancia
  ganancias[src].gain.value = 0;
  ahora = audioCtx.currentTime;
  ganancias[src].gain.setValueAtTime(0, ahora);
  ganancias[src].gain.linearRampToValueAtTime(1, ahora + amp1[0]); 
  ganancias[src].gain.linearRampToValueAtTime(amp1[2], ahora + amp1[0] + amp1[1]);

  let buffer = audioCtx.createBuffer(1, largosOnda[nota], sampleRate);
  buffer.copyToChannel(matrizNotas[nota], 0);

  sources[src]= audioCtx.createBufferSource();
  sources[src].loop=true;
  sources[src].buffer = buffer;
  sources[src].connect(ganancias[src]).connect(audioCtx.destination);
  sources[src].start();

  src++;
  if(src>=sources.length)src=0;

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

  if(indiceOnda==5||indiceOnda==3){
    document.querySelector("#custom").style.cssText="top:-202px;transition:top 0.5s;";
    document.querySelector("#amp1").style.cssText="top:0px;transition:top 0.5s;";
    boolAmp1=false;
  }
  else document.querySelector("#custom").style.cssText="top:0px;transition:top 0.5s;";

  ctxCustom.clearRect(0,0,canvasCustom.width,canvasCustom.height);

  ctxCustom.fillStyle = "rgb(48,48,48)";
  for(i=0;i<cantArmonicos;i++){
      // ctxCustom.fillRect(i*anchoColumna+1, 2, 9, canvasCustom.height-4);
      ctxCustom.fillRect(i*anchoColumna+1, 2, anchoColumna-1, canvasCustom.height-4);
  }

  let alto=canvasCustom.height-4;

  ctxCustom.fillStyle = "rgba(122, 31, 31, 0.6)";
  for(i=0;i<cantArmonicos;i++){
      if(indiceOnda==5)ctxCustom.fillRect(i*anchoColumna+1, alto+2, anchoColumna-1, -armonicosCustom[i]*alto);
      else ctxCustom.fillRect(i*anchoColumna+1, alto+2, anchoColumna-1, -armonicosRandom[i]*alto);
  }

}

document.querySelector("#botSeno").addEventListener("mousedown",()=>{indiceOnda=0;mostrarCustom();crearArrays();});
document.querySelector("#botCuadrada").addEventListener("mousedown",()=>{indiceOnda=1;mostrarCustom();crearArrays();});
document.querySelector("#botTriangular").addEventListener("mousedown",()=>{indiceOnda=2;mostrarCustom();crearArrays();});
document.querySelector("#botRandom").addEventListener("mousedown",()=>{
  indiceOnda=3;
  armonicosRandom.splice(0,armonicosRandom.length);
  cantArmonicosRandom=Math.round(Math.random()*70);
  for(i=0;i<cantArmonicosRandom;i++)armonicosRandom[i]=Math.random();
  mostrarCustom();
  crearArrays();
});
document.querySelector("#botRuido").addEventListener("mousedown",()=>{indiceOnda=4;mostrarCustom();crearArrays();});
document.querySelector("#botCustom").addEventListener("mousedown",()=>{indiceOnda=5;mostrarCustom();crearArrays();});
document.querySelector("#subirOctava").addEventListener("mousedown",()=>{if(octava<5){octava++;crearArrays();}});
document.querySelector("#bajarOctava").addEventListener("mousedown",()=>{if(octava>0){octava--;crearArrays();}});

document.addEventListener("mouseup",()=>{
  document.querySelector("#amp1").removeEventListener("mousemove",clickAmp1);triggerAmp1=false;
  document.querySelector("#custom").removeEventListener("mousemove",clickCustom);triggerCustom=false;
  crearArrays();
});

document.querySelector("#botAmp1").addEventListener("mousedown",()=>{
  if(!boolAmp1){
    document.querySelector("#amp1").style.cssText="top:-102px;transition:top 0.5s;";
    document.querySelector("#custom").style.cssText="top:0px;transition:top 0.5s;";
    boolCustom=false;
  }
  else document.querySelector("#amp1").style.cssText="top:0px;transition:top 0.5s;";
  boolAmp1=!boolAmp1;
})

document.querySelector("#mas1st").addEventListener("mousedown",()=>transponer(1));
document.querySelector("#menos1st").addEventListener("mousedown",()=>transponer(-1));

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

// document.querySelector("#teclado").addEventListener("mousedown",clickear);
// document.querySelector("#teclado").addEventListener("mouseup",silenciar);
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
muestreoAmp1();

let triggerAmp1=false,posX,posY;
document.querySelector("#amp1").addEventListener("mousedown",()=>{
  clickAmp1();
  document.querySelector("#amp1").addEventListener("mousemove",clickAmp1);
});
document.querySelector("#amp1").addEventListener("mouseup",()=>{
  document.querySelector("#amp1").removeEventListener("mousemove",clickAmp1);
  triggerAmp1=false;
});

function muestreoAmp1(){
  ctxAmp.clearRect(0,0,canvasAmp.width,canvasAmp.height);
  ctxAmp.font="16px arial";
  let ancho,total=580;
  ctxAmp.fillStyle="rgba(48, 48, 48, 1)";
  for(i=0;i<5;i++){
    ctxAmp.fillRect(2,20*i+2,total,18);
  }
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

function clickAmp1(){

  let total=580;
  let posCanvas = canvasAmp.getBoundingClientRect();
  
  posX=Math.floor(event.clientX-posCanvas.left);

  if(!triggerAmp1){
    posY=Math.floor(event.clientY-posCanvas.top);

    posY=Math.floor(posY/20);
    
  }
  triggerAmp1=true;

  posX=posX*maxAmps[posY]/total;
  if(posY<5)amp1[posY]=posX;

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

  crearArrays();
  muestreoAmp1();

}

let triggerCustom=false,posX2,posY2;
document.querySelector("#custom").addEventListener("mousedown",()=>{
  clickCustom();
  document.querySelector("#custom").addEventListener("mousemove",clickCustom);
});
document.querySelector("#custom").addEventListener("mouseup",()=>{
  document.querySelector("#custom").removeEventListener("mousemove",clickCustom);
  crearArrays();
  triggerCustom=false;
});

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




document.querySelector("#debug").addEventListener("mousedown",funcionDebug1);
document.querySelector("#debug2").addEventListener("mousedown",funcionDebug2);

function funcionDebug1(){
}
function funcionDebug2(){
}
function debug(cosa="XD"){
  console.log(cosa);
}