import React from 'react';
import type { Sale } from '../../services/types';

interface PrintableTicketProps {
  sale: Sale | null;
}

/**
 * Componente diseñado específicamente para ser impreso en un ticket térmico de 80mm
 * Usa CSS puro y ocultación de interfaz gráfica general.
 */
export const PrintableTicket: React.FC<PrintableTicketProps> = ({ sale }) => {
  if (!sale) return null;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);
  };

  return (
    <div className="print-ticket">
      <style>
        {`
          /* Ocultar este componente en pantalla normal */
          @media screen {
            .print-ticket { display: none; }
          }
          
          /* Solo imprimir este componente, ocultando el resto de la app */
          @media print {
            body, html {
              height: auto !important;
              overflow: visible !important;
            }
            body * { visibility: hidden; }
            .print-ticket, .print-ticket * { visibility: visible; }
            .print-ticket {
              position: absolute;
              left: 50%;
              top: 0;
              transform: translateX(-50%);
              width: 72mm; /* Ancho seguro para evitar cortes y centrar perfectamente */
              margin: 0;
              padding: 8mm 2mm;
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              line-height: 1.35;
              color: black;
              background-color: white;
            }
            @page {
              margin: 0; /* Sin márgenes en la configuración general */
            }
          }

          /* Estilos internos del ticket */
          .ticket-header { text-align: center; margin-bottom: 12px; border-bottom: 1px dashed black; padding-bottom: 8px; }
          .ticket-title { font-size: 16px; font-weight: bold; margin: 0 0 3px 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .ticket-subtitle { font-size: 10px; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1px; }
          .ticket-info { margin: 2px 0; font-size: 11px; }
          .ticket-table { width: 100%; text-align: left; margin-bottom: 12px; border-collapse: collapse; }
          .ticket-table th { border-bottom: 1px dashed black; padding: 4px 0; font-weight: bold; font-size: 11px;}
          .ticket-table td { padding: 4px 0; font-size: 11px; vertical-align: top;}
          .ticket-col-qty { width: 15%; }
          .ticket-col-desc { width: 55%; }
          .ticket-col-total { width: 30%; text-align: right; font-weight: bold; }
          .ticket-totals { border-top: 1px dashed black; padding-top: 6px; text-align: right; margin-bottom: 12px; }
          .ticket-total-line { font-size: 15px; font-weight: bold; margin: 4px 0;}
          .ticket-footer { text-align: center; margin-top: 15px; border-top: 1px dashed black; padding-top: 10px; font-size: 11px;}
        `}
      </style>

      <div className="ticket-header">
        <h1 className="ticket-title">SHADDAI - SHOP</h1>
        <p className="ticket-subtitle">COMPROBANTE DE COMPRA</p>
        <p className="ticket-info">Ticket N°: {sale.id.substring(0, 8).toUpperCase()}</p>
        <p className="ticket-info">Fecha: {formatDate(sale.createdAt)}</p>
        <p className="ticket-info">Cajero/a: {((sale.seller as { name?: string })?.name) || 'Cajero'}</p>
        <p className="ticket-info">Método: {sale.paymentMethod.toUpperCase()}</p>
      </div>

      <table className="ticket-table">
        <thead>
          <tr>
            <th className="ticket-col-qty">CANT</th>
            <th className="ticket-col-desc">DESCRIPCIÓN</th>
            <th className="ticket-col-total">IMPORTE</th>
          </tr>
        </thead>
        <tbody>
          {sale.details?.map((detail, idx) => (
            <tr key={idx}>
              <td className="ticket-col-qty">
                {detail.unitType === 'kilogramo' ? detail.quantity.toFixed(3) : detail.quantity}
              </td>
              <td className="ticket-col-desc">
                {detail.productName}
                <div style={{fontSize: '9px', color: '#555'}}>
                  {detail.quantity} x {formatCurrency(detail.unitPrice)}
                </div>
              </td>
              <td className="ticket-col-total">{formatCurrency(detail.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ticket-totals">
        {sale.notes && sale.notes.includes('PROMOCIÓN') && (
          <p className="ticket-info">Venta con promoción aplicada</p>
        )}
        <p className="ticket-total-line">TOTAL: {formatCurrency(sale.total)}</p>
      </div>

      <div className="ticket-footer">
        <p>¡Gracias por su compra!</p>
        <p style={{marginTop: '5px'}}>Conserve su ticket.</p>
      </div>
    </div>
  );
};
