export const createHTMLAttributeTable = (zoomLng, zoomLat, list) =>{
    
    const tableDiv = document.createElement('div');
    tableDiv.style.cssText = 'max-height: 200px; max-width: 30vw; overflow: scroll; background:transparent'
    const style = document.createElement('style');
    style.innerHTML = `::-webkit-scrollbar {display: none;}`;
    tableDiv.appendChild(style);
    const table = document.createElement('table');
    table.setAttribute('class', 'table table-hover');
    const tbody = document.createElement('tbody');
    for (var prop in list) {
        let tr = document.createElement('tr');
        let th1 = document.createElement('th');
        th1.textContent = prop;
        let th2 = document.createElement('th');
        th2.textContent = list[prop];
        tr.appendChild(th1)
        tr.appendChild(th2)
        tbody.appendChild(tr)
        th1.style.cssText = 'background:transparent'
        th2.style.cssText = 'background:transparent; font-weight: normal;'

    }
    table.appendChild(tbody)
    tableDiv.appendChild(table)
    
    
    return tableDiv
}