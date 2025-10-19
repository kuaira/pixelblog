import MarkdownIt from 'markdown-it'
import taskLists from 'markdown-it-task-lists'
import container from 'markdown-it-container'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})
  .use(taskLists)
  .use(container, 'warning')
  .use(container, 'info')

// 自定义规则：自动给外链加 target="_blank"
md.renderer.rules.link_open = (tokens, idx, options, env, renderer) => {
  const aIndex = tokens[idx].attrIndex('target')
  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank'])
  }
  return renderer.renderToken(tokens, idx, options)
}

export default md