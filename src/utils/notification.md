# 通知系统使用说明

本项目实现了统一的提示管理系统，包含三种类型的提示：

## 1. Toast 提示 (自动消失)

用于显示操作结果、状态更新等不需要用户确认的信息。

### 使用方法

```typescript
import { toast, success, error, warning, info } from '../utils/notification';

// 基础用法
toast('这是一条消息');

// 带类型的快捷方法
success('操作成功');
error('操作失败');
warning('警告信息');
info('提示信息');

// 自定义选项
toast('自定义消息', { 
  type: 'success', 
  duration: 5000 
});
```

### 类型说明
- `success`: 成功提示 (绿色)
- `error`: 错误提示 (红色)
- `warning`: 警告提示 (黄色)
- `info`: 信息提示 (蓝色)

## 2. Confirm 确认框 (需要用户确认)

用于需要用户确认的重要操作，如删除、退出等。

### 使用方法

```typescript
import { confirm } from '../utils/notification';

// 基础用法
const confirmed = await confirm('标题', '确认要执行此操作吗？');
if (confirmed) {
  // 用户点击了确认
  console.log('用户确认了操作');
} else {
  // 用户点击了取消
  console.log('用户取消了操作');
}

// 带选项的用法
const confirmed = await confirm('删除确认', '确定要删除这个项目吗？', {
  type: 'danger',
  confirmText: '删除',
  cancelText: '取消'
});
```

### 类型说明
- `danger`: 危险操作 (红色按钮)
- `warning`: 警告操作 (黄色按钮)
- `info`: 普通确认 (蓝色按钮)

## 3. Alert 警告框 (重要信息)

用于显示重要的警告或错误信息，需要用户点击确定。

### 使用方法

```typescript
import { alert } from '../utils/notification';

// 基础用法
await alert('标题', '这是一条重要的警告信息');

// 带选项的用法
await alert('系统错误', '发生了一个严重的错误，请联系管理员', {
  type: 'error',
  confirmText: '我知道了'
});
```

### 类型说明
- `success`: 成功信息 (绿色)
- `error`: 错误信息 (红色)
- `warning`: 警告信息 (黄色)
- `info`: 普通信息 (蓝色)

## 使用场景建议

### Toast 适用于：
- 操作成功/失败的反馈
- 状态更新提示
- 网络请求结果
- 表单验证错误

### Confirm 适用于：
- 删除操作确认
- 退出操作确认
- 重要设置变更确认
- 数据丢失风险的操作

### Alert 适用于：
- 系统错误提示
- 权限不足提示
- 重要警告信息
- 需要用户注意的严重问题

## 注意事项

1. **异步操作**: `confirm` 和 `alert` 都是异步函数，需要使用 `await` 或 `.then()`
2. **错误处理**: 建议在 try-catch 块中使用，确保错误被正确处理
3. **用户体验**: 根据操作的重要程度选择合适的提示类型
4. **国际化**: 所有文本都支持中文，后续可以扩展为国际化支持

## 示例代码

```typescript
// 删除操作示例
const handleDelete = async () => {
  try {
    const confirmed = await confirm('删除确认', '确定要删除这个项目吗？', { type: 'danger' });
    if (confirmed) {
      await deleteItem(id);
      success('删除成功');
    }
  } catch (err) {
    error('删除失败');
  }
};

// 保存操作示例
const handleSave = async () => {
  try {
    await saveData(data);
    success('保存成功');
  } catch (err) {
    error('保存失败，请重试');
  }
};

// 权限检查示例
const handleAdminAction = async () => {
  if (!isAdmin) {
    await alert('权限不足', '您没有权限执行此操作', { type: 'error' });
    return;
  }
  // 执行管理员操作
};
``` 