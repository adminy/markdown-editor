const renderTasklist = function (str) {
  // Checked task-list box match
  if (str.match(/<li>\[x\]\s+\w+/gi)) {
    str = str.replace(/(<li)(>\[x\]\s+)(\w+)/gi,
        `$1 style="list-style-type: none;"><input type="checkbox" 
        checked style="list-style-type: none; 
        margin: 0 0.2em 0 -1.3em;" disabled> $3`)
  }
  // Unchecked task-list box match
  if (str.match(/<li>\[ \]\s+\w+/gi)) {
    str = str.replace(/(<li)(>\[ \]\s+)(\w+)/gi,
        `$1 style="list-style-type: none;"><input type="checkbox" 
          style="list-style-type: none; 
          margin: 0 0.2em 0 -1.3em;" disabled> $3`)
  }
  return str
}

module.exports = renderTasklist
