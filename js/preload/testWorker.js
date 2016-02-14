onmessage=function(event){
    if(event.data == "Bonjour"){
        postMessage("Bonjour, je suis un worker");
    }else{
        postMessage("Maintenant je sais que tu es "+
            JSON.stringify(event.data) +" !");
    }
};