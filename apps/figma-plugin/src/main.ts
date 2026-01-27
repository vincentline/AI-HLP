// AI-HLP Figma插件主逻辑
// 模块功能：处理Figma插件的核心逻辑，包括UI显示、消息通信和自动命名
// 技术栈：TypeScript、Figma Plugin API

// 使用@figma/plugin-typings提供的类型定义

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
    // 检查用户是否选中了frame
    const selectedFrame = getSelectedFrame();
    if (!selectedFrame) {
      figma.ui.postMessage({ 
        type: 'error', 
        message: '请先选择一个Frame' 
      });
      return;
    }
    
    // 检查是否已取消
    if (isCancelled) {
      return;
    }
    
    // 获取frame结构数据
    const frameData = getFrameStructure(selectedFrame);
    
    // 检查是否已取消
    if (isCancelled) {
      return;
    }
    
    // 构建提示词
    const prompt = buildPrompt(frameData, customPrompt);
    
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
    const successCount = applyNamingSuggestions(selectedFrame, namingSuggestions);
    
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
      // 检查元素透明度是否为0
      const hasOpacity = 'opacity' in child;
      if (hasOpacity && child.opacity === 0) {
        // 透明度为0的元素，不获取该节点及其子节点的任何信息
        return;
      }
      
      // 检查元素是否有导出信息
      const hasExportInfo = 'exportSettings' in child && child.exportSettings && child.exportSettings.length > 0;
      
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
        hasExportInfo: hasExportInfo,
        hasOpacity: hasOpacity,
        opacity: hasOpacity ? child.opacity : 1, // 默认不透明
        style: {} // 样式信息
      };
      
      // 根据元素类型提取额外信息和样式
      switch (child.type) {
        case 'TEXT':
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
          break;
        
        case 'RECTANGLE':
        case 'ELLIPSE':
        case 'POLYGON':
        case 'STAR':
        case 'VECTOR':
          const shapeNode = child as VectorNode | RectangleNode | EllipseNode | PolygonNode | StarNode;
          if (Array.isArray(shapeNode.fills) && shapeNode.fills.length > 0) {
            element.fillColor = shapeNode.fills[0].type === 'SOLID' ? shapeNode.fills[0].color : null;
          }
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
          element.style = {
            backgroundColor: 'backgroundColor' in child ? child.backgroundColor : null,
            clipsContent: 'clipsContent' in child ? child.clipsContent : false,
            opacity: child.opacity,
            blendMode: child.blendMode
          };
          break;
      }
      
      // 如果元素没有导出信息，并且不是透明度为0的元素，递归处理子节点
      if (!hasExportInfo && (hasOpacity ? child.opacity > 0 : true) && 'children' in child) {
        // 递归处理所有子节点，包括组件内部
        element.children = getElements(child, depth + 1);
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
    return false;
  }
  
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
      figma.ui.postMessage({ 
        type: 'api-key-error', 
        message: `API请求失败: ${response.status} ${response.statusText}` 
      });
      return false;
    }
    
    const responseData = await response.json();
    return true;
  } catch (error: any) {
    figma.ui.postMessage({ 
      type: 'api-key-error', 
      message: `网络请求失败: ${error.message}` 
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
 * @param {FrameNode} frame - Frame节点
 * @param {Object} namingSuggestions - 命名建议
 * @returns {number} 成功命名的元素数量
 */
function applyNamingSuggestions(frame: FrameNode, namingSuggestions: any): number {
  let successCount = 0;
  
  // 递归应用命名建议
  function applyToNode(node: any) {
    // 检查节点是否在命名建议中，并且不是组件类型
    if (namingSuggestions[node.id] && node.type !== 'COMPONENT' && node.type !== 'INSTANCE') {
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


