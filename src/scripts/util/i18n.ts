// eslint-disable-next-line no-undef, no-constant-condition
export const getI18nMessage = (
  typeof browser !== 'undefined' ? browser : chrome
).i18n.getMessage

function parseString(s: string | null) {
  // license: The MIT License, Copyright (c) 2016-2019 YUKI "Piro" Hiroshi
  // original: http://github.com/piroor/webextensions-lib-l10n

  if (s === null) return null
  return s.replace(/__MSG_([@\w]+)__/g, (matched, key) => {
    return getI18nMessage(key) || matched
  })
}

export function parseDocument() {
  const texts = document.evaluate(
    'descendant::text()[contains(self::text(), "__MSG_")]',
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  )
  for (let i = 0, maxi = texts.snapshotLength; i < maxi; i++) {
    const text = texts.snapshotItem(i) as Node
    text.nodeValue = parseString(text.nodeValue)
  }

  const attributes = document.evaluate(
    'descendant::*/attribute::*[contains(., "__MSG_")]',
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  )

  for (let i = 0, maxi = attributes.snapshotLength; i < maxi; i++) {
    const attribute = attributes.snapshotItem(i) as Node
    attribute.nodeValue = parseString(attribute.nodeValue)
  }
}
