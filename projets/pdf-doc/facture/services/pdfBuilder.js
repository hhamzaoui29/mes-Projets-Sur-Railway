class PdfBuilder {

                    constructor(pdfDoc, font, boldFont) {
                                                            this.pdfDoc = pdfDoc;
                                                            this.font = font;
                                                            this.boldFont = boldFont;

                                                            this.page = pdfDoc.addPage();
                                                            this.width = this.page.getWidth();
                                                            this.height = this.page.getHeight();

                                                            this.margin = 50;
                                                            this.currentY = this.height - 80;
                                                        }

                    // ===============================
                    // Ajouter une nouvelle page
                    // ===============================
                    addPage() {
                                    this.page = this.pdfDoc.addPage();
                                    this.width = this.page.getWidth();
                                    this.height = this.page.getHeight();
                                    this.currentY = this.height - 80;
                                }

                    // ===============================
                    // Ajouter espace vertical
                    // ===============================
                    space(amount) {
                                        this.currentY -= amount;
                                    }

                 }
