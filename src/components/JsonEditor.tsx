import React, { useState } from 'react';

interface JsonEditorProps {
  data: any;
  onChange: (data: any) => void;
}

interface JsonNodeProps {
  data: any;
  path: string[];
  onChange: (path: string[], value: any) => void;
  onAdd: (path: string[], type: 'object' | 'array' | 'value') => void;
  onDelete: (path: string[]) => void;
}

interface AddModalProps {
  isOpen: boolean;
  type: 'object' | 'array' | 'value';
  onClose: () => void;
  onConfirm: (key: string, value?: string) => void;
}

const AddModal: React.FC<AddModalProps> = ({ isOpen, type, onClose, onConfirm }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (key.trim() === '') return;
    if (type === 'value' && value.trim() === '') return;
    
    onConfirm(key, type === 'value' ? value : undefined);
    setKey('');
    setValue('');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 z-50 w-80">
        <h3 className="text-lg font-medium mb-4">
          {type === 'object' ? '添加对象' : type === 'array' ? '添加数组' : '添加值'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              属性名
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="请输入属性名"
            />
          </div>
          {type === 'value' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                值
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="请输入值"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            确定
          </button>
        </div>
      </div>
    </>
  );
};

const JsonNode: React.FC<JsonNodeProps> = ({ data, path, onChange, onAdd, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [modalType, setModalType] = useState<'object' | 'array' | 'value' | null>(null);

  const handleAdd = (type: 'object' | 'array' | 'value') => {
    console.log('当前路径:', path);
    console.log('当前数据:', data);
    console.log('数据类型:', Array.isArray(data) ? '数组' : '对象');
    console.log('添加类型:', type);

    // 如果是数组，直接添加对应的空值
    if (Array.isArray(data)) {
      console.log('当前是数组，直接添加空', type);
      const newData = [...data];
      if (type === 'value') {
        newData.push('');
      } else if (type === 'object') {
        newData.push({});
      } else if (type === 'array') {
        newData.push([]);
      }
      onChange(path, newData);
      return;
    }

    setModalType(type);
  };

  const handleModalConfirm = (key: string, value?: string) => {
    if (!modalType) return;
    
    let newValue;
    if (modalType === 'object') {
      newValue = {};
    } else if (modalType === 'array') {
      newValue = [];
    } else {
      newValue = value;
    }
    
    const newData = Array.isArray(data) ? [...data] : { ...data };
    if (Array.isArray(data)) {
      console.log('当前是数组，直接添加值');
      newData.push(newValue);
    } else {
      console.log('当前是对象，使用 key-value 方式添加');
      newData[key] = newValue;
    }
    onChange(path, newData);
    setModalType(null);
  };

  const handleDelete = (key: string) => {
    const newData = Array.isArray(data) ? [...data] : { ...data };
    if (Array.isArray(data)) {
      console.log('当前是数组，使用 splice 删除元素');
      newData.splice(parseInt(key), 1);
    } else {
      console.log('当前是对象，使用 delete 删除属性');
      delete newData[key];
    }
    onChange(path, newData);
  };

  const isArray = Array.isArray(data);

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
        <span className="text-gray-700">{isArray ? '[' : '{'}</span>
        <div className="flex gap-1">
          <button
            onClick={() => handleAdd('value')}
            className="text-xs px-1 py-0.5 bg-gray-100 hover:bg-gray-200 rounded"
            title="添加值"
          >
            +值
          </button>
          <button
            onClick={() => handleAdd('object')}
            className="text-xs px-1 py-0.5 bg-gray-100 hover:bg-gray-200 rounded"
            title="添加对象"
          >
            +对象
          </button>
          <button
            onClick={() => handleAdd('array')}
            className="text-xs px-1 py-0.5 bg-gray-100 hover:bg-gray-200 rounded"
            title="添加数组"
          >
            +数组
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-start">
              {!isArray && (
                <div className="flex items-center">
                  <span className="text-blue-600">"{key}"</span>
                  <span className="text-gray-700">:</span>
                </div>
              )}
              <div className="flex-1 ml-1">
                {typeof value === 'object' && value !== null ? (
                  <JsonNode
                    data={value}
                    path={[...path, key]}
                    onChange={onChange}
                    onAdd={onAdd}
                    onDelete={onDelete}
                  />
                ) : (
                  <input
                    type="text"
                    value={value as string}
                    onChange={(e) => onChange([...path, key], e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                )}
              </div>
              <button
                onClick={() => handleDelete(key)}
                className="text-red-500 hover:text-red-700 ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="ml-4">
        <span className="text-gray-700">{isArray ? ']' : '}'}</span>
      </div>

      <AddModal
        isOpen={modalType !== null}
        type={modalType || 'value'}
        onClose={() => setModalType(null)}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

const JsonEditor: React.FC<JsonEditorProps> = ({ data, onChange }) => {
  const handleChange = (path: string[], value: any) => {
    if (path.length === 0) {
      onChange(value);
      return;
    }
    
    const newData = { ...data };
    let current = newData;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    onChange(newData);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <JsonNode
        data={data}
        path={[]}
        onChange={handleChange}
        onAdd={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
};

export default JsonEditor; 