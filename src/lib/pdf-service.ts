import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CabinetItem, Project, CuttingPlan } from '../types/furniture';

export async function exportToPDF(
  project: Project, 
  plans: CuttingPlan[], 
  threeDImage?: string, 
  planImages?: string[]
) {
  // Use 'l' for landscape if it benefits the plans, but stick to 'p' (portrait) for general consistency
  const doc = new jsPDF();
  const date = new Date(project.createdAt).toLocaleDateString();

  // Color Palette
  const primaryColor: [number, number, number] = [107, 112, 92]; // #6B705C
  const secondaryColor: [number, number, number] = [183, 181, 151]; // #B7B597

  // --- PAGE 1: COVER & PARTS LIST ---
  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('MaderApp', 14, 25);
  doc.setFontSize(10);
  doc.text('REPORTE TÉCNICO DE FABRICACIÓN', 14, 32);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(14);
  doc.text('Detalles del Proyecto', 14, 55);
  
  doc.setFontSize(10);
  doc.text(`Nombre: ${project.name}`, 14, 65);
  doc.text(`Cliente: ${project.clientName}`, 14, 71);
  doc.text(`Fecha: ${date}`, 14, 77);

  // 3D View if available
  let y = 90;
  if (threeDImage) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('VISTA PREVIA 3D', 14, y);
    doc.setFont('helvetica', 'normal');
    
    try {
      // Add a shadow/border effect for the image
      doc.setDrawColor(230, 230, 230);
      doc.rect(14, y + 5, 180, 80, 'S');
      doc.addImage(threeDImage, 'PNG', 15, y + 6, 178, 78);
      y += 95;
    } catch (e) {
      console.error('Error adding 3D image to PDF', e);
      y += 10;
    }
  }

  // Parts List
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LISTA DE PIEZAS (DESPIECE)', 14, y);
  y += 10;

  project.items.forEach((item, index) => {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.name} (${item.type.toUpperCase()})`, 14, y);
    y += 5;

    const tableData = item.parts.map(p => [
      p.name,
      `${p.width} mm`,
      `${p.height} mm`,
      `${p.thickness} mm`,
      p.quantity.toString(),
      p.material
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Nombre', 'Ancho', 'Largo', 'Espesor', 'Cant.', 'Material']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    });

    // @ts-ignore
    y = doc.lastAutoTable.finalY + 15;
  });

  // --- PAGE 2+: CUTTING OPTIMIZATION ---
  if (plans.length > 0) {
    doc.addPage();
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('OPTIMIZACIÓN DE CORTE (PLANOS)', 14, 13);
    
    doc.setTextColor(60, 60, 60);
    let planY = 35;
    
    plans.forEach((plan, index) => {
      if (planY > 230) {
        doc.addPage();
        planY = 25;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`PLANCHA #${index + 1} - ${plan.sheet.width}x${plan.sheet.height}mm`, 14, planY);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Optimización: ${plan.usage.toFixed(1)}%`, 14, planY + 5);
      
      if (planImages && planImages[index]) {
        try {
          // Calculate max area for the plan image
          const maxWidth = 180;
          const maxHeight = 100;
          
          const sheetAspectRatio = plan.sheet.width / plan.sheet.height;
          let imgWidth = maxWidth;
          let imgHeight = imgWidth / sheetAspectRatio;
          
          if (imgHeight > maxHeight) {
            imgHeight = maxHeight;
            imgWidth = imgHeight * sheetAspectRatio;
          }

          doc.setDrawColor(200, 200, 200);
          doc.rect(14, planY + 10, imgWidth, imgHeight, 'S');
          doc.addImage(planImages[index], 'PNG', 14, planY + 10, imgWidth, imgHeight);
          planY += imgHeight + 25;
        } catch (e) {
          console.error('Error adding plan image to PDF', e);
          planY += 15;
        }
      } else {
        planY += 20;
      }
    });
  }

  doc.save(`MaderApp_${project.name.replace(/\s+/g, '_')}.pdf`);
}
