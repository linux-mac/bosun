package elastic

import (
	"encoding/json"
	"testing"
)

func TestHasParentQueryTest(t *testing.T) {
	f := NewHasParentQuery("blog", NewTermQuery("tag", "something"))
	data, err := json.Marshal(f.Source())
	if err != nil {
		t.Fatalf("marshaling to JSON failed: %v", err)
	}
	got := string(data)
	expected := `{"has_parent":{"parent_type":"blog","query":{"term":{"tag":"something"}}}}`
	if got != expected {
		t.Errorf("expected\n%s\n,got:\n%s", expected, got)
	}
}
