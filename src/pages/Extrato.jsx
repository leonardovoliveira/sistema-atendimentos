import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'

function Extrato({ atendimentos = [], setAtendimentos = () => {} }) {
  return (
    <div className="container mx-auto py-10">
      <h1>Extrato Funcionando - Teste de Imports</h1>
    </div>
  );
}

export default Extrato;
