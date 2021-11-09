import 'highlight.js/styles/github.css'
import 'codemirror-spell-checker/dist/spell-checker.min.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-light.css'
import 'material-icons/iconfont/material-icons.css'
import 'github-markdown-css'
import './index.css'
import 'codemirror/mode/gfm/gfm'
import 'emojify.js/dist/css/basic/emojify.min.css'
import 'emojify.js/dist/css/sprites/emojify.min.css'
import 'emojify.js/dist/css/sprites/emojify-emoticons.min.css'

// import 'codemirror/addon/mode/overlay'
// import 'codemirror/addon/fold/markdown-fold'
window.React = require('jsx-dom')
const choo = require('choo')
const app = choo()
app.mount('body')

// store procedures
app.use(require('./store-procedures/editor'))

// routes
app.route('/', require('./views/editor'))
