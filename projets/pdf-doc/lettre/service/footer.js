function drawFooter(page, data, fonts, layout, currentY) {

    const { bold } = fonts;
    const { marginRight} = layout;

    const pageWidth = page.getWidth();

    const signature = `${data.prenom} ${data.nom}`;
    const textWidth = bold.widthOfTextAtSize(signature, 12);
    currentY = currentY - 50;
    page.drawText(signature, {
                                x: pageWidth - marginRight - textWidth - 120,
                                y: currentY,
                                size: 12,
                                font:bold,
                            });
}

module.exports = { drawFooter };