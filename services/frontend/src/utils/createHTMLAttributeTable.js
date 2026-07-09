export const createHTMLAttributeTable = (zoomLng, zoomLat, list) => {
    const tableDiv = document.createElement('div');
    
    // Width defaults to max-content so short entries stay small
    tableDiv.style.cssText = 'max-height: 200px; min-width: 100px; max-width: 300px !important; overflow-y: auto; overflow-x: hidden; background:transparent;';
    
    const style = document.createElement('style');
    style.innerHTML = `::-webkit-scrollbar {display: none;}`;
    tableDiv.appendChild(style);
    
    const table = document.createElement('table');
    table.setAttribute('class', 'table table-hover');
    table.style.cssText = 'width: 100%; margin-bottom: 0;';
    
    const tbody = document.createElement('tbody');
    
    for (var prop in list) {
        let tr = document.createElement('tr');
        
        let th1 = document.createElement('th');
        th1.textContent = prop;
        th1.style.cssText = 'background:transparent; white-space: nowrap; padding-right: 10px; vertical-align: top;';
        
        let td2 = document.createElement('td');
        const valueString = String(list[prop] ?? '');
        td2.textContent = valueString;
        
        // BASE STYLES for the value cell
        let tdStyles = 'background:transparent; font-weight: normal; vertical-align: top;';
        
        // IF VALUE IS LONGER THAN 25 CHARACTERS:
        // We limit the column width to roughly ~200px (forcing it to break onto a new line) 
        // and tell it to break anywhere it needs to.
        if (valueString.length > 20) {
            tdStyles += ' max-width: 220px; white-space: normal; overflow-wrap: break-word; word-break: break-word;';
        } else {
            // Keep short text nicely on one line without premature wrapping
            tdStyles += ' white-space: nowrap;';
        }
        
        td2.style.cssText = tdStyles;
        
        tr.appendChild(th1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
    }
    
    table.appendChild(tbody);
    tableDiv.appendChild(table);
    
    return tableDiv;
};