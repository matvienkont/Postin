var input = document.getElementsByClassName("input-photo")[0];

if(input) 
{
    input.addEventListener("input", function () 
    {
        var regex = /\.[a-zA-Z0-9]+$/;
        var result = regex.test(input.files[0].name);
        console.log(result);
        if(result)
        {
            var fileName = document.getElementById("file-name");
            fileName.innerHTML = "Your file: " + input.files[0].name;
            fileName.style.display = "block";
        } else 
        {
            var fileName = document.getElementById("file-name");
            fileName.innerHTML = "Does not seem like a photo, couldn't load it";
            setTimeout(()=>
            { 
                fileName.innerHTML = "";
            }, 4000)
        }
    });
}