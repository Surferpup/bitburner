/** @param {NS} ns */
export async function main(ns) {
    var element = document.body.lastChild
    var newList = document.createElement("ul");
    var stringArray = ["Home","About","Our Services","Contact Us"];
    
    // Create a <ul> element
    var newUL = element.appendChild(newList);
    
    function buildList(){
        for(var i = 0; i < stringArray.length; i++){
            // Create a text node
            var newTextNode = document.createTextNode(stringArray[i]); 
    
            // Create a list element
            var newListItem = document.createElement("li");
            
            // Append text node and list item
            newListItem.appendChild(newTextNode); 
            newUL.appendChild(newListItem); 
        }
    }
    
    buildList(); 
    }