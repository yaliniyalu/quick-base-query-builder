import Vue from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

Vue.component("vue-json-pretty", VueJsonPretty)

import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'

// import more codemirror resource...

Vue.use(VueCodemirror)