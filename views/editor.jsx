module.exports = (state, emit) => (
  <body id='toplevel'>
    <div id='in'><form><textarea id='code'># New Document</textarea></form></div>
    <div id='out' class='markdown-body' />
    <div id='menu'>
      <span>Save As</span>
      <div onclick={_ => emit('saveAsMarkdown')}>
        <svg height='64' width='64' xmlns='http://www.w3.org/2000/svg'>
          <g transform='scale(0.0625)'>
            <path d='M950.154 192H73.846C33.127 192 0 225.12699999999995 0 265.846v492.308C0 798.875 33.127 832 73.846 832h876.308c40.721 0 73.846-33.125 73.846-73.846V265.846C1024 225.12699999999995 990.875 192 950.154 192zM576 703.875L448 704V512l-96 123.077L256 512v192H128V320h128l96 128 96-128 128-0.125V703.875zM767.091 735.875L608 512h96V320h128v192h96L767.091 735.875z' />
          </g>
        </svg>
        <span>Markdown</span>
      </div>
      <div onclick={_ => emit('saveAsHtml')}>
        <svg height='64' width='64' xmlns='http://www.w3.org/2000/svg'>
          <g transform='scale(0.0625) translate(64,0)'>
            <path d='M608 192l-96 96 224 224L512 736l96 96 288-320L608 192zM288 192L0 512l288 320 96-96L160 512l224-224L288 192z' />
          </g>
        </svg>
        <span>HTML</span>
      </div>
      <a id='close-menu' onclick={_ => emit('menu.hide')}>&times;</a>
    </div>
    <div id='navbar'>
      <div id='navcontent'>
        <a id='logo' href='https://github.com/jbt/markdown-editor' tooltip='Check out the code on Github!'>
          <p id='title' class='left'># Markdown Editor</p>
        </a>
        <p id='openbutton' title='Open from Disk' class='navbutton left' onclick="document.getElementById('fileInput').click();"><i class='material-icons'>open_in_browser</i></p>
        <input id='fileInput' onchange={e => emit('editor.file.open', e)} type='file' class='hidden' accept='.md,.mdown,.txt,.markdown' />
        <p id='savebutton' title='Download' class='navbutton left' onclick={_ => emit('menu.show')}><i class='material-icons'>file_download</i></p>
        <p id='browsersavebutton' title='Browser Save (Experimental)' class='navbutton left' onclick='saveInBrowser()'><i class='material-icons'>save</i></p>
        <p id='sharebutton' title='Generate Shareable Link' class='navbutton left' onclick={_ => emit('updateHash')}><i class='material-icons'>share</i></p>
        <p id='nightbutton' title='Night Mode' class='navbutton left' onclick={_ => emit('toggleNightMode')}><i class='material-icons'>invert_colors</i></p>
        <p id='readbutton' title='Reading Mode' class='navbutton left' onclick={_ => emit('toggleReadMode')}><i class='material-icons'>chrome_reader_mode</i></p>
        <p id='spellbutton' title='Spell Check' class='navbutton left selected' onclick={_ => emit('toggleSpellCheck')}><i class='material-icons'>spellcheck</i></p>
        <p class='navbutton left hidden' onclick={_ => emit('editor.clear')}>Clear</p>
        <p id='sharebutton' class='navbutton left selected hidden'>Share</p>
      </div>
    </div>
  </body>
)
