export const getI18nMessage = (typeof browser === 'undefined' ? chrome : browser).i18n.getMessage

// License: The MIT License, Copyright (c) 2016-2019 YUKI "Piro" Hiroshi
// Original: http://github.com/piroor/webextensions-lib-l10n
function parseString(s: string | null): string | null {
  if (s === null) {
    // The return value will be assign to Node.nodeValue, which does not accept
    // undefined value.
    // eslint-disable-next-line unicorn/no-null
    return null
  }

  return s.replaceAll(/__MSG_([@\w]+)__/g, (matched, key: string) => {
    return getI18nMessage(key) || matched
  })
}

export function parseDocument(): void {
  const texts = document.evaluate(
    'descendant::text()[contains(self::text(), "__MSG_")]',
    document,
    // Respect the MDN doc which states that the argument could only be null.
    // See https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate.
    // eslint-disable-next-line unicorn/no-null
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    // Respect the MDN doc which states that the argument could only be null.
    // See https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate.
    // eslint-disable-next-line unicorn/no-null
    null
  )
  for (let i = 0, maxi = texts.snapshotLength; i < maxi; i++) {
    const text = texts.snapshotItem(i)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    text!.nodeValue = parseString(text!.nodeValue)
  }

  const attributes = document.evaluate(
    'descendant::*/attribute::*[contains(., "__MSG_")]',
    document,
    // Respect the MDN doc which states that the argument could only be null.
    // See https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate.
    // eslint-disable-next-line unicorn/no-null
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    // Respect the MDN doc which states that the argument could only be null.
    // See https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate.
    // eslint-disable-next-line unicorn/no-null
    null
  )

  for (let i = 0, maxi = attributes.snapshotLength; i < maxi; i++) {
    const attribute = attributes.snapshotItem(i)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    attribute!.nodeValue = parseString(attribute!.nodeValue)
  }
}
