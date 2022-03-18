
async function close_loading() {
    m = document.getElementById('loading')
    m.style = '';
    if (m.children.length > 1) {
        m.removeChild(m.lastChild)
    }
}

async function loading() {
    main_container = document.getElementById('loading')
    main_container.style = 'display:block'
    temp = document.getElementById('loading-template');
    item = temp.content.querySelector("div");
    a = document.importNode(item, true);
    main_container.append(a);
}
