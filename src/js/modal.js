function close_modal() {
    m = document.getElementById('modal')
    m.style = '';
    if (m.children.length > 1) {
        m.removeChild(m.lastChild)
    }
}

function modal() {
    main_container = document.getElementById('modal')
    main_container.style = 'display:block'
    temp = document.getElementById('modal-template');
    item = temp.content.querySelector("div");
    a = document.importNode(item, true);
    main_container.append(a);
}