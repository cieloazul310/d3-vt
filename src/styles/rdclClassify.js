export function rdclClassify(feature) {
  const { rdCtg, rnkWidth, type, state } = feature.properties;
  const classes = ['rdcl'];

  switch (rdCtg) {
    case '高速自動車国道等':
      classes.push('highway');
      break;
    case '国道':
      classes.push('nation');
      break;
    case '都道府県道':
      classes.push('pref');
      break;
  }

  switch (rnkWidth) {
    case '19.5m以上':
      classes.push('full-width');
      break;
    case '13m-19.5m未満':
      classes.push('wide');
      break;
    case '3m-5.5m未満':
      classes.push('thinner');
      break;
    case '3m未満':
      classes.push('thin');
      break;
  }

  switch (type) {
    case '庭園路':
      classes.push('garden');
  }

  switch (state) {
    case '橋・高架':
      classes.push('bridge');
      break;
    case 'トンネル':
      classes.push('tunnel');
      break;
  }

  return classes.join(' ');
}

const rdCtgs = ['都道府県道', '国道', '高速自動車国道等'];

export function rdclLvOrderCompare(a, b) {
  return a.properties.lvOrder > b.properties.lvOrder ? 1 : rdCtgs.indexOf(a.properties.rdCtg) - rdCtgs.indexOf(b.properties.rdCtg);
}
