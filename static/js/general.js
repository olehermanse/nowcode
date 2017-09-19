function onchange_func(event = null)
{
    if (window.location.pathname == "/")
    {
        return;
    }
    var content = $('#editor_code').val();
    var path = "/api/buffers" + window.location.pathname;
    var data = JSON.stringify({"content": content});
    $.ajax(
    {
        type: 'POST',
        url: path,
        data: JSON.stringify(data),
        success: null,
        contentType: "application/json",
        dataType: 'json'
    });
    return;
}

function init_webapp()
{
    var e = document.getElementById('editor_code');
    if (e != null)
    {
        e.oninput = onchange_func;
        e.onpropertychange = e.oninput;
    }
    return ;
}

function refresh_buffer()
{
    if (window.location.pathname == "/")
    {
        return;
    }
    var path = "/api/buffers" + window.location.pathname;
    $.getJSON( path, function( data )
    {
        var content = data["content"];
        var buf = $('#editor_code');

        buf.val(content);
    });
}

setInterval(refresh_buffer, 200);
setInterval(onchange_func, 2000);
