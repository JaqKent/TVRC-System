import React from 'react';
import * as XLSX from 'xlsx';
import { Button } from 'react-bootstrap';

const ExportBalanceExcel = ({
  paginatedPaid,
  paginatedUnpaid,
  totalRecaudado,
  selectedMonth,
  selectedYear,
  disabled,
}) => {
  const handleExport = () => {
    const pagadosData = paginatedPaid.map(({ player, pago }) => {
      const base = {
        Socio: player.name || player.id,
        Monto:
          typeof pago.amount === 'number'
            ? pago.amount
            : parseFloat(pago.amount),
        Mes: pago.month.includes('otros-conceptos')
          ? 'Otros conceptos'
          : selectedMonth,
        Año: selectedYear,
      };

      if (pago.month.includes('otros-conceptos')) {
        base.Nota = pago.additionalNotes || '—';
      }

      return base;
    });

    pagadosData.push({
      Socio: 'TOTAL',
      Monto: totalRecaudado,
      Mes: '',
      Año: '',
      Nota: '',
    });

    const deudoresData = paginatedUnpaid.map((player) => ({
      Socio: player.name || player.id,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(pagadosData),
      'Pagaron'
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(deudoresData),
      'Deudores'
    );

    XLSX.writeFile(wb, `Balance_${selectedMonth}-${selectedYear}.xlsx`);
  };

  return (
    <Button variant='success' onClick={handleExport} disabled={disabled}>
      Imprimir balance
    </Button>
  );
};

export default ExportBalanceExcel;
