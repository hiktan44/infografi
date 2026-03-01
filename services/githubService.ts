
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { RepoFileTree } from '../types';

async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error('GitHub API istek limiti doldu. Lütfen bir süre bekleyin veya farklı bir IP ile deneyin.');
    }
    if (response.status === 404) {
      throw new Error(`GitHub Deposu bulunamadı (404). Deponun herkese açık (public) olduğundan ve URL'nin (owner/repo) doğru yazıldığından emin olun.`);
    }
    throw new Error(`GitHub API Hatası: ${response.status}. Lütfen daha sonra tekrar deneyin.`);
  }
  const data = await response.json();
  return data.default_branch || 'main';
}

export async function fetchRepoFileTree(owner: string, repo: string): Promise<RepoFileTree[]> {
  try {
    // 1. Deponun varsayılan dalını (main/master/dev) tespit et
    const branch = await getDefaultBranch(owner, repo);

    // 2. Dosya ağacını recursive olarak getir
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);

    if (response.ok) {
      const data = await response.json();
      
      if (data.truncated) {
        console.warn('Uyarı: Depo çok büyük olduğu için dosya ağacı GitHub tarafından kesildi.');
      }

      // Sadece kod ve yapılandırma dosyalarını filtrele (AI bağlamını temiz tutmak için)
      return (data.tree || []).filter((item: any) => 
        item.type === 'blob' && 
        item.path.match(/\.(js|jsx|ts|tsx|py|go|rs|java|c|cpp|h|hpp|cs|php|rb|swift|kt|dart|json|yaml|yml|toml|xml|html|css)$/i) &&
        !item.path.includes('node_modules') &&
        !item.path.includes('dist/') &&
        !item.path.includes('build/') &&
        !item.path.includes('public/') &&
        !item.path.startsWith('.')
      );
    }

    if (response.status === 403 || response.status === 429) {
      throw new Error('GitHub API istek limiti doldu.');
    }

    throw new Error(`Depo içeriğine (${branch} dalı) şu an erişilemiyor.`);
      
  } catch (error: any) {
    console.error('GitHub Service Error:', error);
    throw new Error(error.message || `Depo verisi çekilemedi. Lütfen internet bağlantınızı veya depo adresini kontrol edin.`);
  }
}
