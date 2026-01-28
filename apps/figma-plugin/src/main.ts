// AI-HLP Figma插件主逻辑
// 模块功能：处理Figma插件的核心逻辑，包括UI显示、消息通信和自动命名
// 技术栈：TypeScript、Figma Plugin API

// 使用@figma/plugin-typings提供的类 型定义

// 显示插件UI界面
figma.showUI(__html__, {
  height: 500
});

// 取消标志
let isCancelled = false;

// 监听来自UI的消息
figma.ui.onmessage = (msg: any) => {
  // 处理重命名请求
  if (msg.type === 'rename') {
    // 重置取消标志
    isCancelled = false;
    // 调用自动命名功能
    autoRename(msg.prompt);
  }
  
  // 处理取消重命名请求
  if (msg.type === 'cancel-rename') {
    isCancelled = true;
  }
  
  // 处理关闭插件请求
  if (msg.type === 'close') {
    figma.closePlugin();
  }
  
  // 保存API Key
  if (msg.type === 'save-api-key') {
    aiConfig.huoshan.apiKey = msg.apiKey;
    // 保存到Figma客户端存储
    figma.clientStorage.setAsync('huoshanApiKey', msg.apiKey);
    // 发送API Key状态更新
    figma.ui.postMessage({ type: 'api-key', apiKey: aiConfig.huoshan.apiKey });
  }
  
  // 获取API Key
  if (msg.type === 'get-api-key') {
    // 从Figma客户端存储获取
    figma.clientStorage.getAsync('huoshanApiKey').then((apiKey: string) => {
      if (apiKey) {
        aiConfig.huoshan.apiKey = apiKey;
      }
      // 发送API Key到UI
      figma.ui.postMessage({ type: 'api-key', apiKey: aiConfig.huoshan.apiKey });
    });
  }
  
  // 测试API Key有效性
  if (msg.type === 'test-api-key') {
    testApiKey().then((isValid) => {
      if (isValid) {
        figma.ui.postMessage({ type: 'api-key-valid', message: 'API Key 有效' });
      }
      // 不再发送api-key-invalid消息，因为testApiKey函数已经发送了详细的api-key-error消息
    });
  }
};

// 初始化时从存储加载API Key
figma.clientStorage.getAsync('huoshanApiKey').then((apiKey: string) => {
  if (apiKey) {
    aiConfig.huoshan.apiKey = apiKey;
  }
});

/**
 * 命名规范配置
 */
const namingConfig = {
  // 命名风格
  style: 'figma2code', // 切换到Figma2Code规范
  
  // 命名规范
  rules: [
    '切图图层必须以 ic_ (图标) 或 img_ (图片) 开头',
    '页面状态使用正斜杠 / 建立层级',
    '禁止使用无意义的默认名称如 "Frame 123"',
    '整个视觉单元应统一命名',
    '使用英文命名，保持一致性'
  ],
  
  // 元素类型命名规则
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
  },
  
  // 命名案例
  examples: [
    {
      before: 'Frame 1',
      after: 'Login/Default',
      reason: '使用层级结构表达页面状态'
    },
    {
      before: 'Ellipse 2',
      after: 'ic_user_icon',
      reason: '图标使用ic_前缀'
    },
    {
      before: 'Rectangle 3',
      after: 'bg_header',
      reason: '背景使用bg_前缀'
    },
    {
      before: 'Frame 4',
      after: 'img_hero_banner',
      reason: '图片使用img_前缀'
    }
  ]
};

/**
 * AI服务配置
 */
const aiConfig = {
  // 火山AI模型配置
  huoshan: {
    model: 'doubao-seed-1-8-251228',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    apiKey: '', // 从Figma客户端存储获取
    version: 'v1',
    // 简化请求参数配置，移除可能不支持的参数
    requestOptions: {
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: 1500
    }
  },
  
  // 系统提示词
  systemPrompt: `任务：根据输入的Figma元素信息，按照Figma2Code设计规范生成标准化的命名。

重要命名规范：
1. 切图图层必须以 ic_ (图标) 或 img_ (图片) 开头
2. 页面状态使用正斜杠 / 建立层级
3. 禁止使用无意义的默认名称如 "Frame 123"
4. 整个视觉单元应统一命名
5. 使用英文命名，保持一致性

输入：包含Figma元素详细信息的对象数组
输出：符合Figma2Code规范的命名对象，键为元素ID，值为建议的名称`,
  
  // 提示词模板
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

/**
 * 自动命名功能主入口
 * @param {string} customPrompt - 用户自定义提示词
 */
async function autoRename(customPrompt: string) {
  try {
    // 检查用户是否选中了支持的主体元素
    const selectedElement = getSelectedElement();
    if (!selectedElement) {
      figma.ui.postMessage({ 
        type: 'error', 
        message: '请先选择一个Frame、Component、Component Set或Group' 
      });
      return;
    }
    
    // 检查是否已取消
    if (isCancelled) {
      return;
    }
    
    // 获取元素结构数据
    const elementData = getElementStructure(selectedElement);
    
    // 检查是否已取消
    if (isCancelled) {
      return;
    }
    
    // 构建提示词
    const prompt = buildPrompt(elementData, customPrompt);
    
    // 检查是否已取消
    if (isCancelled) {
      return;
    }
    
    // 调用AI服务获取命名建议
    const namingSuggestions = await callAIService(prompt);
    
    // 检查是否已取消
    if (isCancelled) {
      return;
    }
    
    // 应用命名建议
    const successCount = applyNamingSuggestions(selectedElement, namingSuggestions);
    
    // 检查是否已取消
    if (isCancelled) {
      return;
    }
    
    // 发送成功响应
    figma.ui.postMessage({ 
      type: 'renameComplete', 
      successCount: successCount 
    });
  } catch (error: any) {
    // 检查是否已取消
    if (!isCancelled) {
      figma.ui.postMessage({ 
        type: 'error', 
        message: `命名失败：${error.message}` 
      });
    }
  }
}

/**
 * 获取用户选中的主体元素
 * @returns {SceneNode | null} 选中的主体元素节点
 */
function getSelectedElement(): SceneNode | null {
  // 检查是否只有一个选中元素
  if (figma.currentPage.selection.length !== 1) {
    return null;
  }
  
  // 检查选中元素是否为支持的主体元素类型
  const selectedNode = figma.currentPage.selection[0];
  const supportedTypes = ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'GROUP'];
  if (supportedTypes.includes(selectedNode.type)) {
    return selectedNode;
  }
  
  return null;
}

/**
 * 获取元素的结构数据
 * @param {SceneNode} element - 主体元素节点
 * @returns {Object} 包含元素结构的对象
 */
function getElementStructure(element: SceneNode): any {
  return {
    elementName: element.name,
    originalName: element.name, // 保留原来的元素名称
    type: element.type,
    width: element.width,
    height: element.height,
    elements: getElements(element, 0)
  };
}

/**
 * 检查元素是否应被排除
 * @param {SceneNode} node - 要检查的节点
 * @returns {boolean} 是否应被排除
 */
function isElementExcluded(node: SceneNode): boolean {
  // 检查隐藏状态
  if ('visible' in node && !node.visible) {
    return true;
  }
  
  // 检查蒙版状态
  if ('isMask' in node && node.isMask) {
    return true;
  }
  
  // 检查导出状态
  if ('exportSettings' in node && node.exportSettings && node.exportSettings.length > 0) {
    return true;
  }
  
  // 检查组件/组件集类型
  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    return true;
  }
  
  return false;
}

/**
 * 获取元素的基础数据
 * @param {SceneNode} node - 元素节点
 * @returns {Object} 基础数据对象
 */
function getBasicElementData(node: SceneNode): any {
  const basicData: any = {
    id: node.id,
    type: node.type,
    originalName: node.name,
    name: node.name,
    width: node.width || 0,
    height: node.height || 0,
    x: node.x || 0,
    y: node.y || 0,
    opacity: 'opacity' in node ? node.opacity : 1
  };
  
  // 添加约束规则
  if ('constraints' in node) {
    basicData.constraints = node.constraints;
  }
  
  // 添加旋转角度
  if ('rotation' in node) {
    basicData.rotation = node.rotation;
  }
  
  // 添加圆角属性
  if ('cornerRadius' in node) {
    basicData.cornerRadius = node.cornerRadius;
  }
  
  // 添加填充信息
  if ('fills' in node) {
    basicData.fills = node.fills;
  }
  
  // 添加描边信息
  if ('strokes' in node) {
    basicData.strokes = node.strokes;
    basicData.strokeWeight = node.strokeWeight;
    basicData.strokeAlign = node.strokeAlign;
  }
  
  // 添加效果属性
  if ('effects' in node) {
    basicData.effects = node.effects;
  }
  
  return basicData;
}

/**
 * 递归获取元素列表
 * @param {SceneNode} parentNode - 父节点
 * @param {number} depth - 元素层级深度
 * @returns {Array} 元素列表
 */
function getElements(parentNode: SceneNode, depth: number = 0): any[] {
  const elements: any[] = [];
  
  // 检查是否已取消
  if (isCancelled) {
    return elements;
  }
  
  // 检查节点是否有children属性
  if ('children' in parentNode) {
    // 遍历子节点
    parentNode.children.forEach((child: SceneNode, index: number) => {
      // 检查是否已取消
      if (isCancelled) {
        return;
      }
      
      // 检查元素是否应被排除
      if (isElementExcluded(child)) {
        return;
      }
      
      let element: any;
      
      // 根据元素类型获取不同级别的数据
      switch (child.type) {
        case 'TEXT':
          // 文本：完整获取
          element = {
            id: child.id,
            type: child.type,
            originalName: child.name,
            name: child.name,
            width: child.width || 0,
            height: child.height || 0,
            x: child.x || 0,
            y: child.y || 0,
            depth: depth,
            index: index,
            opacity: 'opacity' in child ? child.opacity : 1
          };
          
          const textNode = child as TextNode;
          element.textContent = textNode.characters.length > 100 ? textNode.characters.substring(0, 100) + '...' : textNode.characters;
          element.fontSize = textNode.fontSize;
          element.style = {
            fontFamily: typeof textNode.fontName === 'object' ? textNode.fontName?.family || '' : '',
            fontStyle: typeof textNode.fontName === 'object' ? textNode.fontName?.style || '' : '',
            fontSize: textNode.fontSize,
            textAlignHorizontal: textNode.textAlignHorizontal,
            textAlignVertical: textNode.textAlignVertical,
            fills: textNode.fills,
            opacity: textNode.opacity,
            blendMode: textNode.blendMode
          };
          
          // 递归处理子节点
          if ('children' in child) {
            element.children = getElements(child, depth + 1);
          }
          break;
          
        case 'FRAME':
        case 'GROUP':
          // 画框/分组：完整获取
          element = {
            id: child.id,
            type: child.type,
            originalName: child.name,
            name: child.name,
            width: child.width || 0,
            height: child.height || 0,
            x: child.x || 0,
            y: child.y || 0,
            depth: depth,
            index: index,
            opacity: 'opacity' in child ? child.opacity : 1
          };
          
          // 添加样式信息
          if ('backgroundColor' in child) {
            element.style = {
              backgroundColor: child.backgroundColor,
              clipsContent: 'clipsContent' in child ? child.clipsContent : false,
              opacity: child.opacity,
              blendMode: child.blendMode
            };
          }
          
          // 递归处理子节点
          if ('children' in child) {
            element.children = getElements(child, depth + 1);
          }
          break;
          
        case 'INSTANCE':
          // 实例：完整获取但标记不参与命名
          element = {
            id: child.id,
            type: child.type,
            originalName: child.name,
            name: child.name,
            width: child.width || 0,
            height: child.height || 0,
            x: child.x || 0,
            y: child.y || 0,
            depth: depth,
            index: index,
            opacity: 'opacity' in child ? child.opacity : 1,
            excludeFromNaming: true // 标记实例不参与命名
          };
          
          // 添加样式信息
          if ('backgroundColor' in child) {
            element.style = {
              backgroundColor: child.backgroundColor,
              clipsContent: 'clipsContent' in child ? child.clipsContent : false,
              opacity: child.opacity,
              blendMode: child.blendMode
            };
          }
          
          // 递归处理子节点
          if ('children' in child) {
            element.children = getElements(child, depth + 1);
          }
          break;
          
        case 'RECTANGLE':
        case 'ELLIPSE':
        case 'POLYGON':
        case 'STAR':
        case 'VECTOR':
          // 矢量图形：仅获取基础数据
          element = getBasicElementData(child);
          element.depth = depth;
          element.index = index;
          break;
          
        case 'LINE':
        case 'CONNECTOR':
        case 'WIDGET':
        case 'EMBED':
          // 媒体与嵌入式元素：仅获取基础数据
          element = getBasicElementData(child);
          element.depth = depth;
          element.index = index;
          break;
          
        default:
          // 其他类型元素：完整获取
          element = {
            id: child.id,
            type: child.type,
            originalName: child.name,
            name: child.name,
            width: child.width || 0,
            height: child.height || 0,
            x: child.x || 0,
            y: child.y || 0,
            depth: depth,
            index: index,
            opacity: 'opacity' in child ? child.opacity : 1
          };
          
          // 递归处理子节点
          if ('children' in child) {
            element.children = getElements(child, depth + 1);
          }
          break;
      }
      
      // 添加到元素列表
      elements.push(element);
    });
  }
  
  return elements;
}

/**
 * 构建提示词
 * @param {Object} frameData - Frame结构数据
 * @param {string} customPrompt - 用户自定义提示词
 * @returns {string} 完整的提示词
 */
function buildPrompt(frameData: any, customPrompt: string): string {
  // 格式化命名规范
  const namingRules = namingConfig.rules.join('\n- ');
  
  // 格式化命名案例
  const namingExamples = namingConfig.examples.map(example => 
    `Before: ${example.before}\nAfter: ${example.after}\nReason: ${example.reason}`
  ).join('\n\n');
  
  // 格式化元素类型规则
  const elementRules = Object.entries(namingConfig.elementRules)
    .map(([type, rule]) => 
      `${type}:\n  Prefix: ${rule.prefix}\n  Suffix: ${rule.suffix}\n  Example: ${rule.example}`
    )
    .join('\n\n');
  
  // 格式化元素信息
  const elementInfo = JSON.stringify(frameData, null, 2);
  
  // 替换提示词模板中的占位符
  let prompt = aiConfig.promptTemplate;
  prompt = prompt.replace('{{namingRules}}', `- ${namingRules}`);
  prompt = prompt.replace('{{namingExamples}}', namingExamples);
  prompt = prompt.replace('{{elementRules}}', elementRules);
  prompt = prompt.replace('{{elementInfo}}', elementInfo);
  
  return prompt;
}

/**
 * 测试API Key有效性
 * @returns {Promise<boolean>} API Key是否有效
 */
async function testApiKey(): Promise<boolean> {
  const { endpoint, apiKey, model, requestOptions } = aiConfig.huoshan;
  
  if (!endpoint || !apiKey) {
    figma.ui.postMessage({ 
      type: 'api-key-error', 
      message: 'API Key未配置' 
    });
    return false;
  }
  
  // 验证API Key格式 - 支持多种格式
  if (!apiKey || apiKey.length < 20) {
    figma.ui.postMessage({ 
      type: 'api-key-error', 
      message: 'API Key格式不正确，请检查输入' 
    });
    return false;
  }
  
  // 不再强制要求API Key以ak-开头，因为不同服务可能有不同的API Key格式
  
  try {
    const requestBody = {
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant specialized in Figma2Code design规范. Return responses in JSON format."
        },
        {
          role: "user",
          content: "测试API Key有效性，请返回简短确认信息。请以JSON格式返回，例如：{\"status\": \"success\", \"message\": \"API Key有效\"}"
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
      let errorMessage = `API请求失败: ${response.status} ${response.statusText}`;
      
      // 解析具体错误信息
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          if (errorData.error.code === 'Unauthorized') {
            errorMessage = 'API Key无效或已过期';
          } else if (errorData.error.code === 'Forbidden') {
            errorMessage = 'API Key权限不足';
          } else {
            errorMessage = `API错误: ${errorData.error.message || errorData.error.code}`;
          }
        }
      } catch (parseError) {
        // 解析失败，使用原始错误信息
      }
      
      figma.ui.postMessage({ 
        type: 'api-key-error', 
        message: errorMessage 
      });
      return false;
    }
    
    const responseData = await response.json();
    return true;
  } catch (error: any) {
    let errorMessage = `网络请求失败: ${error.message}`;
    
    // 处理常见网络错误
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = '网络连接失败，请检查网络设置';
    } else if (error.message.includes('CORS')) {
      errorMessage = '跨域请求失败，请检查API端点配置';
    }
    
    figma.ui.postMessage({ 
      type: 'api-key-error', 
      message: errorMessage 
    });
    return false;
  }
}

/**
 * 调用AI服务
 * @param {string} prompt - 提示词
 * @returns {Promise<Object>} 命名建议
 */
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
    
    const aiContent = responseData.choices?.[0]?.message?.content;
    if (!aiContent) {
      throw new Error('AI响应格式不正确');
    }
    
    return parseAIResponse(aiContent);
  } catch (error: any) {
    return generateMockNamingSuggestions();
  }
}

/**
 * 解析AI响应
 * @param {string} aiContent - AI生成的内容
 * @returns {Object} 解析后的命名建议
 */
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
      } catch (parseError: any) {
        return generateMockNamingSuggestions();
      }
    }
    
    // 如果仍然解析失败，返回模拟数据
    return generateMockNamingSuggestions();
  }
}

/**
 * 生成模拟命名建议
 * @returns {Object} 模拟的命名建议
 */
function generateMockNamingSuggestions(): any {
  // 返回模拟数据
  return {};
}

/**
 * 应用命名建议
 * @param {SceneNode} element - 主体元素节点
 * @param {Object} namingSuggestions - 命名建议
 * @returns {number} 成功命名的元素数量
 */
function applyNamingSuggestions(element: SceneNode, namingSuggestions: any): number {
  let successCount = 0;
  
  // 递归应用命名建议
  function applyToNode(node: any) {
    // 检查节点是否在命名建议中，并且不是组件类型，也不是实例或标记为不参与命名的元素
    if (namingSuggestions[node.id] && node.type !== 'COMPONENT' && node.type !== 'INSTANCE' && !node.excludeFromNaming) {
      // 更新节点名称
      node.name = namingSuggestions[node.id];
      successCount++;
    }
    
    // 递归处理子节点
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => {
        applyToNode(child);
      });
    }
  }
  
  // 从元素开始递归应用命名建议
  applyToNode(element);
  
  return successCount;
}


