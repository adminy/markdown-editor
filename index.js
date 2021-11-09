import 'highlight.js/styles/github.css'
import 'codemirror-spell-checker/dist/spell-checker.min.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-light.css' // needed?
import './lib/material-icons.css'
import './lib/github-markdown.css'
import './index.css'
import 'codemirror/addon/mode/overlay'
import 'codemirror/mode/gfm/gfm'
// import 'codemirror/addon/fold/markdown-fold'
window.React = require('jsx-dom')
const choo = require('choo')
const app = choo()
app.mount('body')

// store procedures
app.use(require('./store-procedures/editor'))

// routes
app.route('/', require('./views/editor'))
