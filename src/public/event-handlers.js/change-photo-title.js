function startEditing(id) 
{
    window.unitList.forEach( (element, index) => {
        if(element._id==id) 
        {
            var title = document.getElementsByClassName("photo-title")[index];
            title.style.display = "none";
            var input = document.getElementsByClassName("not-displayed")[index];
            input.style.display= "block";
        }
    });
}