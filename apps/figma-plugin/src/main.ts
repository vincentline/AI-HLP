// AI-HLP Figma插件主逻辑
// 模块功能：处理Figma插件的核心逻辑，包括UI显示、消息通信和自动命名
// 技术栈：TypeScript、Figma Plugin API

// 导入Figma插件类型定义
// @ts-ignore - Figma插件API在Figma环境中可用，TypeScript编译时会忽略

// 显示插件UI界面
figma.showUI(__html__, {
  height: 600
});

// 监听来自UI的消息
figma.ui.onmessage = (msg: any) => {
  // 处理重命名请求
  if (msg.type === 'rename') {
    // 调用自动命名功能
    autoRename(msg.prompt);
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
      } else {
        figma.ui.postMessage({ type: 'api-key-invalid', message: 'API Key 无效' });
      }
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
  style: 'semantic', // semantic, camelCase, PascalCase, kebab-case, snake_case
  
  // 命名规范
  rules: [
    '使用语义化名称，清晰表达元素功能',
    '避免使用无意义的名称如 "Rectangle 1"、"Text 2" 等',
    '根据元素类型使用相应的前缀或后缀',
    '保持名称简洁明了，避免过长',
    '对于重复元素，使用序号区分',
    '使用英文命名，保持一致性'
  ],
  
  // 元素类型命名规则
  elementRules: {
    FRAME: {
      prefix: '',
      suffix: 'Frame',
      example: 'HeaderFrame, ContentFrame, FooterFrame'
    },
    TEXT: {
      prefix: '',
      suffix: 'Text',
      example: 'TitleText, DescriptionText, ButtonText'
    },
    RECTANGLE: {
      prefix: '',
      suffix: 'Bg, Rectangle',
      example: 'HeaderBg, CardRectangle'
    },
    ELLIPSE: {
      prefix: '',
      suffix: 'Icon, Avatar',
      example: 'UserAvatar, NotificationIcon'
    },
    COMPONENT: {
      prefix: '',
      suffix: 'Component',
      example: 'ButtonComponent, CardComponent'
    },
    INSTANCE: {
      prefix: '',
      suffix: 'Instance',
      example: 'PrimaryButtonInstance, CardInstance'
    }
  },
  
  // 命名案例
  examples: [
    {
      before: 'Frame 1',
      after: 'HeaderFrame',
      reason: '使用语义化名称表达功能'
    },
    {
      before: 'Text 2',
      after: 'TitleText',
      reason: '根据内容类型命名'
    },
    {
      before: 'Rectangle 3',
      after: 'BackgroundRectangle',
      reason: '清晰表达元素用途'
    },
    {
      before: 'Ellipse 4',
      after: 'UserAvatar',
      reason: '根据元素功能命名'
    }
  ]
};

/**
 * AI服务配置
 */
const aiConfig = {
  // 火山AI模型配置
  huoshan: {
    model: 'doubao-1-5-pro-32k-250115',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    apiKey: '', // 从Figma客户端存储获取
    version: 'v1'
  },
  
  // 系统提示词
  systemPrompt: `任务：根据输入的'画框信息数组'，按照指定格式生成对应的'命名数组'。输入：包含 Figma 画框详细信息的'画框信息数组'，以及命名格式规则'命名格式规则'。输出：符合'命名格式规则'的'命名数组'，数组长度与输入数组一致，每个元素为对应画框的命名结果。范例：'画框信息数组a'→'命名数组a'`,
  
  // 提示词模板
  promptTemplate: `你是一位专业的UI设计师，擅长为Figma设计元素制定规范的命名。

请根据以下命名规范和案例，为提供的Figma Frame结构中的元素生成合适的名称：

## 命名规范
{{namingRules}}

## 命名案例
{{namingExamples}}

## 元素类型命名规则
{{elementRules}}

## 当前Frame结构
{{frameStructure}}

## 用户自定义提示（可选）
{{customPrompt}}

请为每个元素生成一个合适的名称，返回格式为JSON对象，键为元素ID，值为建议的名称。

示例返回格式：
{
  "elementId1": "SuggestedName1",
  "elementId2": "SuggestedName2"
}

注意：
1. 只返回JSON格式，不要添加任何额外的解释
2. 保持名称简洁明了，符合命名规范
3. 确保名称具有语义化，能够清晰表达元素的功能
4. 避免使用无意义的数字或字母组合
5. 对于嵌套元素，考虑其在整体结构中的位置和功能
`
};

/**
 * 自动命名功能主入口
 * @param {string} customPrompt - 用户自定义提示词
 */
async function autoRename(customPrompt: string) {
  try {
    // 检查用户是否选中了frame
    const selectedFrame = getSelectedFrame();
    if (!selectedFrame) {
      figma.ui.postMessage({ 
        type: 'error', 
        message: '请先选择一个Frame' 
      });
      return;
    }
    
    // 获取frame结构数据
    const frameData = getFrameStructure(selectedFrame);
    
    // 构建提示词
    const prompt = buildPrompt(frameData, customPrompt);
    
    // 调用AI服务获取命名建议
    const namingSuggestions = await callAIService(prompt);
    
    // 应用命名建议
    const successCount = applyNamingSuggestions(selectedFrame, namingSuggestions);
    
    // 发送成功响应
    figma.ui.postMessage({ 
      type: 'renameComplete', 
      successCount: successCount 
    });
  } catch (error: any) {
    figma.ui.postMessage({ 
      type: 'error', 
      message: `命名失败：${error.message}` 
    });
  }
}

/**
 * 获取用户选中的Frame
 * @returns {FrameNode | null} 选中的Frame节点
 */
function getSelectedFrame(): FrameNode | null {
  // 检查是否只有一个选中元素
  if (figma.currentPage.selection.length !== 1) {
    return null;
  }
  
  // 检查选中元素是否为Frame
  const selectedNode = figma.currentPage.selection[0];
  if (selectedNode.type === 'FRAME') {
    return selectedNode as FrameNode;
  }
  
  return null;
}

/**
 * 获取Frame的结构数据
 * @param {FrameNode} frame - Frame节点
 * @returns {Object} 包含Frame结构的对象
 */
function getFrameStructure(frame: FrameNode): any {
  return {
    frameName: frame.name,
    originalName: frame.name, // 保留原来的画框名称
    width: frame.width,
    height: frame.height,
    elements: getElements(frame, 0)
  };
}

/**
 * 递归获取元素列表
 * @param {SceneNode} parentNode - 父节点
 * @param {number} depth - 元素层级深度
 * @returns {Array} 元素列表
 */
function getElements(parentNode: SceneNode, depth: number = 0): any[] {
  const elements: any[] = [];
  
  // 检查节点是否有children属性
  if ('children' in parentNode) {
    // 遍历子节点
    parentNode.children.forEach((child: SceneNode, index: number) => {
      // 提取元素基本信息
      const element: any = {
        id: child.id,
        type: child.type,
        originalName: child.name, // 保留原来的元素名称
        name: child.name,
        width: child.width || 0,
        height: child.height || 0,
        x: child.x || 0,
        y: child.y || 0,
        depth: depth, // 元素层级深度
        index: index, // 同级元素中的索引位置
        style: {} // 样式信息
      };
      
      // 根据元素类型提取额外信息和样式
      switch (child.type) {
        case 'TEXT':
          const textNode = child as TextNode;
          element.textContent = textNode.characters;
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
          break;
        
        case 'RECTANGLE':
        case 'ELLIPSE':
        case 'POLYGON':
        case 'STAR':
        case 'VECTOR':
          const shapeNode = child as VectorNode | RectangleNode | EllipseNode | PolygonNode | StarNode;
          // 提取填充颜色信息
          if (Array.isArray(shapeNode.fills) && shapeNode.fills.length > 0) {
            element.fillColor = shapeNode.fills[0].type === 'SOLID' ? shapeNode.fills[0].color : null;
          }
          // 提取样式信息
          element.style = {
            fills: shapeNode.fills,
            strokes: shapeNode.strokes,
            strokeWeight: shapeNode.strokeWeight,
            strokeAlign: shapeNode.strokeAlign,
            cornerRadius: 'cornerRadius' in shapeNode ? shapeNode.cornerRadius : null,
            opacity: shapeNode.opacity,
            blendMode: shapeNode.blendMode
          };
          break;
        
        case 'FRAME':
        case 'COMPONENT':
        case 'INSTANCE':
          // 提取样式信息
          element.style = {
            backgroundColor: 'backgroundColor' in child ? child.backgroundColor : null,
            clipsContent: 'clipsContent' in child ? child.clipsContent : false,
            opacity: child.opacity,
            blendMode: child.blendMode
          };
          // 递归处理嵌套frame和组件
          element.children = getElements(child, depth + 1);
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
  
  // 格式化Frame结构
  const frameStructure = JSON.stringify(frameData, null, 2);
  
  // 替换提示词模板中的占位符
  let prompt = aiConfig.promptTemplate;
  prompt = prompt.replace('{{namingRules}}', `- ${namingRules}`);
  prompt = prompt.replace('{{namingExamples}}', namingExamples);
  prompt = prompt.replace('{{elementRules}}', elementRules);
  prompt = prompt.replace('{{frameStructure}}', frameStructure);
  prompt = prompt.replace('{{customPrompt}}', customPrompt || '无');
  
  return prompt;
}

/**
 * 测试API Key有效性
 * @returns {Promise<boolean>} API Key是否有效
 */
async function testApiKey(): Promise<boolean> {
  // 获取AI配置
  const { endpoint, apiKey, model } = aiConfig.huoshan;
  
  // 检查配置是否完整
  if (!endpoint || !apiKey) {
    return false;
  }
  
  try {
    // 构建测试请求体
    const requestBody = {
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "测试API Key有效性"
        }
      ]
    };
    
    // 发送请求
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // 检查响应状态
    return response.ok;
  } catch (error: any) {
    return false;
  }
}

/**
 * 调用AI服务
 * @param {string} prompt - 提示词
 * @returns {Promise<Object>} 命名建议
 */
async function callAIService(prompt: string): Promise<any> {
  // 获取AI配置
  const { endpoint, apiKey, model } = aiConfig.huoshan;
  
  // 检查配置是否完整
  if (!endpoint || !apiKey) {
    // 如果配置不完整，返回模拟数据
    return generateMockNamingSuggestions();
  }
  
  try {
    // 构建请求体
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
      ]
    };
    
    // 发送请求
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    // 解析响应
    const responseData = await response.json();
    
    // 提取AI生成的内容
    const aiContent = responseData.choices?.[0]?.message?.content;
    if (!aiContent) {
      throw new Error('AI响应格式不正确');
    }
    
    // 解析AI生成的命名建议
    return parseAIResponse(aiContent);
  } catch (error: any) {
    // 失败时返回模拟数据
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
      return JSON.parse(jsonMatch[0]);
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
 * @param {FrameNode} frame - Frame节点
 * @param {Object} namingSuggestions - 命名建议
 * @returns {number} 成功命名的元素数量
 */
function applyNamingSuggestions(frame: FrameNode, namingSuggestions: any): number {
  let successCount = 0;
  
  // 递归应用命名建议
  function applyToNode(node: any) {
    // 检查节点是否在命名建议中
    if (namingSuggestions[node.id]) {
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
  
  // 从frame开始递归应用命名建议
  applyToNode(frame);
  
  return successCount;
}


