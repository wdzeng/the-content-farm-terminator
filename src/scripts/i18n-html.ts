import { i18nMessage as _ } from './util.js'

/*
 license: The MIT License, Copyright (c) 2016-2019 YUKI "Piro" Hiroshi
 original:
   http://github.com/piroor/webextensions-lib-l10n
*/

function updateString(s: string | null) {
  if (s === null) return null
  return s.replace(/__MSG_([@\w]+)__/g, (matched, key) => {
    return _(key) || matched
  })
}

function updateSubtree(node: Node) {
  const texts = document.evaluate(
    'descendant::text()[contains(self::text(), "__MSG_")]',
    node,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  )
  for (let i = 0, maxi = texts.snapshotLength; i < maxi; i++) {
    const text = texts.snapshotItem(i) as Node
    text.nodeValue = updateString(text.nodeValue)
  }

  const attributes = document.evaluate(
    'descendant::*/attribute::*[contains(., "__MSG_")]',
    node,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  )

  for (let i = 0, maxi = attributes.snapshotLength; i < maxi; i++) {
    const attribute = attributes.snapshotItem(i) as Node
    attribute.nodeValue = updateString(attribute.nodeValue)
  }
}

updateSubtree(document)