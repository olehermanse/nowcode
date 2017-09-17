function onchange_func(event = null)
{
    var contents = $('#editor_code').val();
    var path = window.location.href;
    var data = JSON.stringify({"contents": contents});
    $.ajax({
    type: 'POST',
    url: path,
    data: JSON.stringify(data),
    success: null,
    contentType: "application/json",
    dataType: 'json'
    });
    console.log(data);
    console.log(path)
    return;
}


function init_webapp()
{
    console.log("init");
    var e = document.getElementById('editor_code');
    e.oninput = onchange_func;
    e.onpropertychange = e.oninput;
    return ;
}

function refresh_buffer() {
    var path = "/data" + window.location.pathname;
    $.getJSON( path, function( data ) {
        var contents = data["contents"];
        var buf = $('#editor_code');

        buf.val(contents);
    });
}

setInterval(refresh_buffer, 200);
