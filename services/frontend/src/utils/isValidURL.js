export const isValidURL = urlString =>{	
    var a  = document.createElement('a');
     a.href = urlString;
     return (a.host && a.host != window.location.host);
}