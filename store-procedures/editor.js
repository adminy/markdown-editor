const zlib = require('zlib')
const renderTasklist = require('./utils/task-list')
const URL = window.URL || window.webkitURL || window.mozURL || window.msURL
navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob
window.saveAs = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs

const markdownit = require('markdown-it')
const emojify = require('emojify.js')
const hljs = require('highlight.js/lib/common')
const CodeMirror = require('codemirror')
const CodeMirrorSpellChecker = require('codemirror-spell-checker')
const swal = require('sweetalert')
const footNote = require('markdown-it-footnote')

const $ = id => document.getElementById(id)

function save (code, name) {
  const blob = new Blob([code], {
    type: 'text/plain'
  })
  if (window.saveAs) {
    window.saveAs(blob, name)
  } else if (navigator.saveBlob) {
    navigator.saveBlob(blob, name)
  } else {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', name)
    const event = document.createEvent('MouseEvents')
    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null)
    link.dispatchEvent(event)
  }
}

module.exports = (state, emitter) => {
  state.page = {
    menuVisible: false
  }

  emitter.on('menu.show', () => {
    state.page.menuVisible = true
    $('menu').style.display = 'block'
  })

  emitter.on('menu.show', () => {
    state.page.menuVisible = false
    $('menu').style.display = 'none'
  })

  emitter.on('toggleNightMode', () => {
    $('nightbutton').classList.toggle('selected')
    $('menu').style.display = 'none'
    $('toplevel').classList.toggle('nightmode')
  })

  emitter.on('toggleReadMode', () => {
    $('readbutton').classList.toggle('selected')
    $('out').classList.toggle('focused')
    $('in').classList.toggle('hidden')
  })

  emitter.on('toggleSpellCheck', () => {
    $('spellbutton').classList.toggle('selected')
    document.body.classList.toggle('no-spellcheck')
  })

  emitter.on('updateHash', () => {
    window.location.hash = zlib.deflateSync(
      unescape(encodeURIComponent( // convert to utf8
        state.editor.getValue()
      ))
    ).toString('base64')
  })

  // Print the document named as the document title encoded to avoid strange chars and spaces
  emitter.on('saveAsMarkdown', () => {
    save(state.editor.getValue(), document.title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/\s]/gi, '') + '.md')
    emitter.emit('menu.hide')
  })

  // Print the document named as the document title encoded to avoid strange chars and spaces
  emitter.on('saveAsHtml', () => {
    save(document.getElementById('out').innerHTML, document.title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/\s]/gi, '') + '.html')
    emitter.emit('menu.hide')
  })

  emitter.on('editor.clear', () => state.editor.setValue(''))

  emitter.on('editor.file.open', e => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      const files = e.target.files
      console.log(files)
      const reader = new FileReader()
      reader.onload = function (file) {
        console.log(file.target.result)
        state.editor.setValue(file.target.result)
        return true
      }
      reader.readAsText(files[0])
    } else {
      alert('The File APIs are not fully supported in this browser.')
    }
  })

  emitter.on('saveInBrowser', () => {
    const text = state.editor.getValue()
    if (localStorage.getItem('content')) {
      swal({
        title: 'Existing Data Detected',
        text: 'You will overwrite the data previously saved!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes, overwrite!',
        closeOnConfirm: false
      }).then(save => {
        save && localStorage.setItem('content', text)
        save && swal('Saved', 'Your Document has been saved.', 'success')
      })
    } else {
      localStorage.setItem('content', text)
      swal('Saved', 'Your Document has been saved.', 'success')
    }
    console.log('Saved')
  })

  emitter.on('DOMContentLoaded', () => {
    // Because highlight.js is a bit awkward at times
    const languageOverrides = {
      js: 'javascript',
      html: 'xml'
    }

    const md = markdownit({
      html: true,
      highlight: function (code, lang) {
        if (languageOverrides[lang]) lang = languageOverrides[lang]
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(lang, code).value
          } catch (e) {}
        }
        return ''
      }
    }).use(footNote)

    emojify.setConfig({ mode: 'sprite' })
    function setOutput (val) {
      val = val.replace(/<equation>((.*?\n)*?.*?)<\/equation>/ig, function (a, b) {
        return '<img src="http://latex.codecogs.com/png.latex?' + encodeURIComponent(b) + '" />'
      })

      const out = document.getElementById('out')
      const old = out.cloneNode(true)
      out.innerHTML = md.render(val)
      emojify.run(out)
      // console.log(out.innerHTML)
      // Checks if there are any task-list present in out.innerHTML
      out.innerHTML = renderTasklist(out.innerHTML)

      const allold = old.getElementsByTagName('*')
      const allnew = out.getElementsByTagName('*')
      if (!allold || !allnew) return
      for (let i = 0, max = Math.min(allold.length, allnew.length); i < max; i++) {
        if (!allold[i].isEqualNode(allnew[i])) {
          out.scrollTop = allnew[i].offsetTop
          return
        }
      }
    }

    CodeMirrorSpellChecker({ codeMirrorInstance: CodeMirror })

    const editor = CodeMirror.fromTextArea($('code'), {
      mode: 'spell-checker',
      backdrop: 'gfm',
      lineNumbers: false,
      matchBrackets: true,
      lineWrapping: true,
      theme: 'base16-light',
      extraKeys: {
        Enter: 'newlineAndIndentContinueMarkdownList'
      }
    })

    editor.on('change', e => {
      setOutput(e.getValue())
      const headerElements = document.querySelectorAll('h1')
      const header = headerElements?.[0]?.textContent
      const title = header || 'Markdown Editor'
      if (document.title !== title) {
        document.title = title
      }
    })

    function selectionChanger (selection, operator, endoperator) {
      if (selection === '') {
        return operator
      }
      if (!endoperator) {
        endoperator = operator
      }
      const isApplied = selection.slice(0, 2) === operator && selection.slice(-2) === endoperator
      const finaltext = isApplied ? selection.slice(2, -2) : operator + selection + endoperator
      return finaltext
    }

    editor.addKeyMap({
      // bold
      'Ctrl-B': function (cm) {
        cm.replaceSelection(selectionChanger(cm.getSelection(), '**'))
      },
      // italic
      'Ctrl-I': function (cm) {
        cm.replaceSelection(selectionChanger(cm.getSelection(), '_'))
      },
      // code
      'Ctrl-K': function (cm) {
        cm.replaceSelection(selectionChanger(cm.getSelection(), '`'))
      },
      // keyboard shortcut
      'Ctrl-L': function (cm) {
        cm.replaceSelection(selectionChanger(cm.getSelection(), '<kbd>', '</kbd>'))
      }
    })

    document.addEventListener('drop', e => {
      e.preventDefault()
      e.stopPropagation()
      const reader = new FileReader()
      reader.onload = e => editor.setValue(e.target.result)
      reader.readAsText(e.dataTransfer.files[0])
    }, false)

    document.addEventListener('keydown', function (e) {
      if (e.keyCode === 83 && (e.ctrlKey || e.metaKey)) {
        if (localStorage.getItem('content') === editor.getValue()) {
          e.preventDefault()
          return false
        }
        emitter.emit(e.shiftKey ? 'menu.show' : 'saveInBrowser')
        e.preventDefault()
        return false
      }

      if (e.keyCode === 27 && state.page.menuVisible) {
        emitter.emit('menu.hide')

        e.preventDefault()
        return false
      }
    })

    function processQueryParams () {
      const params = window.location.search.split('?')[1]
      window.location.hash && $('readbutton').click() // Show reading view
      if (params) {
        const obj = {}
        params.split('&').forEach(e => (obj[e.split('=')[0]] = e.split('=')[1]))
        obj.reading === 'false' && $('readbutton').click() // Hide reading view
        obj.dark === 'true' && $('nightbutton').click() // Show night view
      }
    }

    window.addEventListener('beforeunload', function (e) {
      if (!editor.getValue() || editor.getValue() === localStorage.getItem('content')) return
      const confirmationMessage = 'It looks like you have been editing something. ' +
                            'If you leave before saving, your changes will be lost.';
      (e || window.event).returnValue = confirmationMessage // Gecko + IE
      return confirmationMessage // Gecko + Webkit, Safari, Chrome etc.
    })

    processQueryParams()
    if (window.location.hash) {
      const h = window.location.hash.replace(/^#/, '')
      if (h.slice(0, 5) === 'view:') {
        setOutput(decodeURIComponent(escape(zlib.inflateSync(Buffer.from(h.slice(5), 'base64')))))
        document.body.className = 'view'
      } else {
        editor.setValue(
          decodeURIComponent(escape(
            zlib.inflateSync(Buffer.from(h, 'base64'))
          ))
        )
      }
    } else if (localStorage.getItem('content')) {
      editor.setValue(localStorage.getItem('content'))
    }
    editor.refresh()
    console.log(editor)
    editor.focus()
    state.editor = editor
  })
}
