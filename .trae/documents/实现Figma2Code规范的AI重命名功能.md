# 实现Figma2Code规范的AI重命名功能详细计划

## 1. 文档分析与引用

### 核心参考文档
1. **Figma2Code设计规范** (`e:\BaiduNetdiskWorkspace\01工作\林嘉跃vincent\自动化\小工具\AI-HLP\AI-HLP\Figma2Code设计规范`)
   - 命名规范：`ic_` (图标) 或 `img_` (图片) 前缀
   - 页面状态：使用正斜杠 `/` 建立层级
   - 禁止默认名称：避免 `Frame 123` 等无意义名称
   - 命名单元化：整个视觉单元统一命名

2. **火山AI官方API文档** (`e:\BaiduNetdiskWorkspace\01工作\林嘉跃vincent\自动化\小工具\AI-HLP\AI-HLP\火山AI调用文档chat.md`)
   - 模型：`doubao-seed-1-8-251228`
   - API端点：`https://ark.cn-beijing.volces.com/api/v3/chat/completions`
   - 支持参数：`response_format`、`temperature`、`top_p`、`thinking`等

3. **现有代码结构** (`e:\BaiduNetdiskWorkspace\01工作\林嘉跃vincent\自动化\小工具\AI-HLP\AI-HLP\apps\figma-plugin\src\main.ts`)
   - `namingConfig`：命名规范配置
   - `aiConfig`：AI服务配置
   - `testApiKey()`：测试API Key
   - `callAIService()`：调用AI服务

## 2. 详细实现步骤

### 步骤1：更新命名规范配置

**修改文件**：`apps/figma-plugin/src/main.ts`

**具体修改**：
```javascript
// 更新namingConfig对象
const namingConfig = {
  style: 'figma2code', // 切换到Figma2Code规范
  rules: [
    '切图图层必须以 ic_ (图标) 或 img_ (图片) 开头',
    '页面状态使用正斜杠 / 建立层级',
    '禁止使用无意义的默认名称如 "Frame 123"',
    '整个视觉单元应统一命名',
    '使用英文命名，保持一致性'
  ],
  elementRules: {
    FRAME: {
      prefix: '',
      suffix: '',
      example: 'Header, Login, Dashboard'
    },
    TEXT: {
      prefix: '',
      suffix: '',
      example: 'Title, Description, ButtonText'
    },
    RECTANGLE: {
      prefix: 'bg_',
      suffix: '',
      example: 'bg_header, bg_card'
    },
    ELLIPSE: {
      prefix: 'ic_',
      suffix: '',
      example: 'ic_user, ic_notification'
    },
    VECTOR: {
      prefix: 'ic_',
      suffix: '',
      example: 'ic_arrow, ic_check'
    },
    COMPONENT: {
      prefix: '',
      suffix: '',
      example: 'Button, Card, Input'
    },
    INSTANCE: {
      prefix: '',
      suffix: '',
      example: 'PrimaryButton, CardInstance'
    }
  }
};
```

### 步骤2：优化AI服务配置

**修改文件**：`apps/figma-plugin/src/main.ts`

**具体修改**：
```javascript
// 更新aiConfig对象
const aiConfig = {
  huoshan: {
    model: 'doubao-seed-1-8-251228',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    apiKey: '',
    version: 'v1',
    // 新增请求参数配置
    requestOptions: {
      response_format: { "type": "json_object" },
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: 1500,
      thinking: { "type": "enabled" },
      reasoning_effort: "medium"
    }
  },
  // 更新系统提示词
  systemPrompt: `任务：根据输入的Figma元素信息，按照Figma2Code设计规范生成标准化的命名。

重要命名规范：
1. 切图图层必须以 ic_ (图标) 或 img_ (图片) 开头
2. 页面状态使用正斜杠 / 建立层级
3. 禁止使用无意义的默认名称如 "Frame 123"
4. 整个视觉单元应统一命名
5. 使用英文命名，保持一致性

输入：包含Figma元素详细信息的对象数组
输出：符合Figma2Code规范的命名对象，键为元素ID，值为建议的名称`,
  // 更新提示词模板
  promptTemplate: `你是一位专业的UI设计师，熟悉Figma2Code设计规范。

请根据以下Figma2Code命名规范，为提供的Figma元素生成标准化的名称：

## Figma2Code命名规范
{{namingRules}}

## 元素类型命名规则
{{elementRules}}

## 当前元素信息
{{elementInfo}}

请为每个元素生成一个符合规范的名称，返回格式为JSON对象，键为元素ID，值为建议的名称。

示例返回格式：
{
  "elementId1": "ic_user_icon",
  "elementId2": "img_hero_banner",
  "elementId3": "Login/Default"
}

注意：
1. 只返回JSON格式，不要添加任何额外的解释
2. 严格遵循Figma2Code命名规范
3. 确保名称语义化且符合元素功能
4. 对于图标使用ic_前缀，对于图片使用img_前缀
5. 对于页面状态使用/建立层级结构`
};
```

### 步骤3：优化API调用实现

**修改文件**：`apps/figma-plugin/src/main.ts`

**具体修改**：
```javascript
// 更新testApiKey函数
async function testApiKey() {
  const { endpoint, apiKey, model, requestOptions } = aiConfig.huoshan;
  
  if (!endpoint || !apiKey) {
    return false;
  }
  
  try {
    const requestBody = {
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant specialized in Figma2Code design规范."
        },
        {
          role: "user",
          content: "测试API Key有效性，请返回简短确认信息."
        }
      ],
      ...requestOptions
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API测试错误:', response.status, response.statusText, errorText);
      figma.ui.postMessage({ 
        type: 'api-key-error', 
        message: `API请求失败: ${response.status} ${response.statusText}` 
      });
      return false;
    }
    
    const responseData = await response.json();
    // 处理思维链内容
    if (responseData.choices[0].message.reasoning_content) {
      console.log('模型思考过程:', responseData.choices[0].message.reasoning_content);
    }
    return true;
  } catch (error: any) {
    console.error('网络请求错误:', error.message);
    figma.ui.postMessage({ 
      type: 'api-key-error', 
      message: `网络请求失败: ${error.message}` 
    });
    return false;
  }
}

// 更新callAIService函数
async function callAIService(prompt: string): Promise<any> {
  const { endpoint, apiKey, model, requestOptions } = aiConfig.huoshan;
  
  if (!endpoint || !apiKey) {
    return generateMockNamingSuggestions();
  }
  
  try {
    const requestBody = {
      model: model,
      messages: [
        {
          role: "system",
          content: aiConfig.systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      ...requestOptions
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const responseData = await response.json();
    // 处理思维链内容
    if (responseData.choices[0].message.reasoning_content) {
      console.log('模型思考过程:', responseData.choices[0].message.reasoning_content);
    }
    
    const aiContent = responseData.choices?.[0]?.message?.content;
    if (!aiContent) {
      throw new Error('AI响应格式不正确');
    }
    
    return parseAIResponse(aiContent);
  } catch (error: any) {
    console.error('AI服务调用错误:', error.message);
    return generateMockNamingSuggestions();
  }
}
```

### 步骤4：优化响应处理

**修改文件**：`apps/figma-plugin/src/main.ts`

**具体修改**：
```javascript
// 更新parseAIResponse函数
function parseAIResponse(aiContent: string): any {
  try {
    // 尝试直接解析JSON
    return JSON.parse(aiContent);
  } catch (error) {
    // 如果直接解析失败，尝试提取JSON部分
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON解析失败:', parseError.message);
        return generateMockNamingSuggestions();
      }
    }
    
    // 如果仍然解析失败，返回模拟数据
    console.error('无法提取JSON数据:', aiContent);
    return generateMockNamingSuggestions();
  }
}
```

### 步骤5：更新构建和测试

**执行命令**：
```bash
# 构建项目
npm run build

# 测试API Key
# 在Figma插件中输入API Key并点击测试按钮

# 测试重命名功能
# 在Figma中选择一个Frame并使用自动命名功能
```

## 3. 技术实现要点

### 核心功能
1. **Figma2Code规范支持**：严格按照设计规范生成命名
2. **AI参数优化**：使用最佳参数配置提高生成质量
3. **深度思考能力**：利用模型的思考过程提高命名准确性
4. **结构化输出**：确保JSON格式的一致性和可靠性
5. **错误处理**：增强错误捕获和用户反馈

### 性能优化
1. **参数调优**：平衡创意性和准确性
2. **响应处理**：优化JSON解析和错误处理
3. **网络请求**：合理设置超时和重试机制
4. **缓存策略**：考虑添加命名结果缓存

### 用户体验
1. **错误反馈**：提供详细的错误信息
2. **进度提示**：显示AI处理状态
3. **结果预览**：在应用命名前显示预览
4. **配置选项**：允许用户调整部分参数

## 4. 测试验证计划

### 测试场景
1. **API Key测试**：验证API Key的有效性
2. **基础命名**：测试简单元素的命名
3. **复杂命名**：测试包含多个元素的Frame
4. **特殊前缀**：测试`ic_`和`img_`前缀的应用
5. **层级结构**：测试页面状态的层级命名
6. **错误处理**：测试网络错误和API错误
7. **边界情况**：测试空选择和特殊字符

### 验证标准
1. **命名规范**：严格符合Figma2Code规范
2. **准确性**：命名符合元素功能和上下文
3. **一致性**：相似元素命名风格一致
4. **响应速度**：API调用响应时间合理
5. **错误处理**：错误情况下提供清晰反馈

## 5. 预期成果

### 功能特性
- ✅ 支持Figma2Code设计规范的AI重命名
- ✅ 优化的API参数配置提高生成质量
- ✅ 利用深度思考能力增强命名准确性
- ✅ 结构化JSON输出确保数据一致性
- ✅ 完整的错误处理和用户反馈

### 技术指标
- **API调用成功率**：>95%
- **命名准确率**：>90%符合Figma2Code规范
- **响应时间**：<5秒（标准网络环境）
- **错误处理覆盖率**：>98%

### 用户价值
- **提高效率**：自动化生成符合规范的命名
- **减少错误**：避免手动命名的不一致性
- **标准化输出**：确保所有命名符合团队规范
- **易于集成**：与MCP工具无缝配合

通过此计划的实施，我们将创建一个功能完整、性能优化、用户友好的AI重命名功能，严格按照Figma2Code设计规范为团队生成标准化的命名，提高工作效率和代码质量。