// Controls.js: Transformation controls UI
export function renderControls(options, onSelect) {
  const controls = document.getElementById('controls');
  if (!controls) return;
  controls.innerHTML = `
    <select id="transformStyle" class="border p-2 rounded">
      ${options.map(opt => `<option value='${opt.value}'>${opt.label}</option>`).join('')}
    </select>
  `;
  document.getElementById('transformStyle').onchange = (e) => onSelect(e.target.value);
}
