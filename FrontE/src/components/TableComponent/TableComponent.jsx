import { Table, Button } from 'antd';
import React, { useState } from 'react'
import Loading from '../../components/LoadingComponent/Loading'
import { Excel } from "antd-table-saveas-excel";
import { useMemo } from 'react';

const TableComponent = (props) => {
  const { selectionType = 'checkbox', data:dataSource = [], isLoading = false, columns = [], handleDelteMany } = props
  const [rowSelectedKeys, setRowSelectedKeys] = useState([])
  const newColumnExport = useMemo(() => {
    return columns
      ?.filter((col) => col.dataIndex !== 'action')
      ?.map((col) => {
        if (col.render) {
          return {
            ...col,
            render: (text, record) => {
              try {
                const val = col.render(text, record);
                if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                  return val;
                }
                // Custom formatting for specific columns to avoid rendering React/AntD elements in Excel
                if (col.dataIndex === 'isPaid') {
                  return record.isPaid || '';
                }
                if (col.dataIndex === 'status') {
                  const statusMap = {
                    pending: 'Chưa giao hàng',
                    delivering: 'Đang giao hàng',
                    delivered: 'Giao hàng thành công',
                    cancelled: 'Đã hủy'
                  };
                  return statusMap[record.status] || record.status || '';
                }
                if (col.dataIndex === 'product' && record.orderItems) {
                  return record.orderItems.map(item => `${item.name} (x${item.amount})`).join(', ');
                }
                // If it's a React element or object, try to fallback to raw string text
                return typeof text === 'object' ? '' : (text || '');
              } catch (e) {
                return typeof text === 'object' ? '' : (text || '');
              }
            }
          };
        }
        return col;
      });
  }, [columns])
  
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setRowSelectedKeys(selectedRowKeys)
    },
    // getCheckboxProps: (record) => ({
    //   disabled: record.name === 'Disabled User',
    //   // Column configuration not to be checked
    //   name: record.name,
    // }),
  };
  const handleDeleteAll = () => {
    handleDelteMany(rowSelectedKeys)
  }
  const exportExcel = () => {
    const excel = new Excel();
    excel
      .addSheet("test")
      .addColumns(newColumnExport)
      .addDataSource(dataSource, {
        str2Percent: true
      })
      .saveAs("Excel.xlsx");
  };
  
  return (
    <Loading isLoading={isLoading}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
        {!!rowSelectedKeys.length && (
          <Button 
            type="primary" 
            danger 
            onClick={handleDeleteAll}
            style={{ fontWeight: 'bold' }}
          >
            Xóa tất cả ({rowSelectedKeys.length})
          </Button>
        )}
        <Button 
          type="default" 
          onClick={exportExcel}
          style={{ borderColor: '#217346', color: '#217346', fontWeight: 'bold' }}
        >
          Xuất Excel
        </Button>
      </div>
      <Table
        rowSelection={{
          type: selectionType,
          ...rowSelection,
        }}
        columns={columns}
        dataSource={dataSource}
        {...props}
      />
    </Loading>
  )
}

export default TableComponent