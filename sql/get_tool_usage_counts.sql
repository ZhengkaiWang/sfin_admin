-- 创建一个SQL函数，用于获取按工具分组的请求数
CREATE OR REPLACE FUNCTION get_tool_usage_counts(limit_count integer)
RETURNS TABLE (
  tool_name text,
  count bigint
) 
LANGUAGE SQL
AS $$
  SELECT 
    tool_name,
    COUNT(*) as count
  FROM 
    api_logs
  WHERE
    tool_name IS NOT NULL
  GROUP BY 
    tool_name
  ORDER BY 
    count DESC
  LIMIT limit_count;
$$;
